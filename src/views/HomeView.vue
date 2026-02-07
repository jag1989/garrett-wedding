<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import WatercolorInput from '../components/ui/WatercolorInput.vue'
import { guests } from '../data/guests'
import { supabase } from '../services/supabase'

const selectedGuestId = ref('')
const email = ref('')
const phone = ref('')


const isSubmitted = ref(false)
const showWeekendDetails = ref(false)
const errorMessage = ref('')
const errors = ref<Record<string, string>>({})
const existingReservation = ref(false)

const selectedGuest = computed(() => {
  return guests.find(g => g.id === selectedGuestId.value)
})

watch(selectedGuestId, async (newId) => {
  if (!newId) return
  
  // Reset form
  email.value = ''
  phone.value = ''
  existingReservation.value = false
  
  try {
    const { data, error } = await supabase
      .from('savethedate')
      .select('email, phone, weekend_accommodation')
      .eq('guest_id', newId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      
    if (data) {
      existingReservation.value = true
    }
  } catch (e) {
    console.error('Error checking existing RSVP:', e)
  }
})

const emailRegex = /^\S+@\S+\.\S+$/
const mobileRegex = /^(?:\+44|0)7\d{9}$/

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!selectedGuestId.value) {
    errors.value.guest = 'Please select your name from the list'
    isValid = false
  }

  if (email.value && !emailRegex.test(email.value)) {
    errors.value.email = 'Please enter a valid email address'
    isValid = false
  }

  const cleanPhone = phone.value.replace(/\s+/g, '')

  if (!phone.value || !mobileRegex.test(cleanPhone)) {
    errors.value.phone = 'Please enter a valid UK mobile number'
    isValid = false
  }

  return isValid
}

watch(email, (newValue) => {
  if (errors.value.email) {
    // If empty (optional) or valid, clear error
    if (!newValue || emailRegex.test(newValue)) {
      delete errors.value.email
    }
  }
})

watch(phone, (newValue) => {
  if (errors.value.phone) {
    const cleanPhone = newValue.replace(/\s+/g, '')
    // Must be present and valid to clear error
    if (newValue && mobileRegex.test(cleanPhone)) {
      delete errors.value.phone
    }
  }
})

const currentRsvpId = ref<number | null>(null)

const handleSubmit = async () => {
  if (!validateForm()) return
  if (!selectedGuest.value) return; 
  
  errorMessage.value = ''
  
  try {
    // Always insert a new record for audit trail
    const { data, error } = await supabase
      .from('savethedate')
      .insert({
        guest_id: selectedGuest.value.id,
        guest_name: selectedGuest.value.name,
        email: email.value,
        phone: phone.value,
        is_weekend_guest: selectedGuest.value.isWeekendGuest
      })
      .select()
      .single()

    if (error) throw error

    // Store the ID of the new row for subsequent updates (accommodation)
    if (data) {
      currentRsvpId.value = data.id
    }

    isSubmitted.value = true
    
    if (selectedGuest.value.isWeekendGuest) {
      showWeekendDetails.value = true
    }
  } catch (e: any) {
    console.error('Error submitting RSVP:', e)
    errorMessage.value = 'Sorry, there was a problem submitting your RSVP. Please try again.'
  }
}

const accommodationSelection = ref<boolean | null>(null)

const updateAccommodation = async (choice: boolean) => {
  if (!currentRsvpId.value) return

  try {
    const { error } = await supabase
      .from('savethedate')
      .update({ weekend_accommodation: choice })
      .eq('id', currentRsvpId.value) // Update the specific row we just created

    if (error) throw error
    
    accommodationSelection.value = choice
  } catch (e) {
    console.error('Error updating accommodation:', e)
  }
}
</script>

<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section text-center">
      <h1 class="names font-script">Katie and Jonathan</h1>
      <div class="details text-serif">
        <p class="date">14th August 2027</p>
        <p class="venue">Dovecote Barns, York</p>
      </div>
      <p class="intro-text text-serif">
        We are so excited to celebrate our special day with you.
        Please let us know if you can make it.
      </p>
    </section>

    <!-- RSVP Form -->
    <section v-if="!isSubmitted" class="rsvp-section container">
      
      <form @submit.prevent="handleSubmit" class="rsvp-form" novalidate>
        
        <div class="form-group" :class="{ 'has-error': errors.guest }">
          <label class="watercolor-label">Guest Name</label>
          <select 
            v-model="selectedGuestId" 
            class="watercolor-select text-serif"
            :class="{ 'is-placeholder': !selectedGuestId }"
          >
            <option value="" disabled>Select your name</option>
            <option v-for="guest in guests" :key="guest.id" :value="guest.id">
              {{ guest.name }}
            </option>
          </select>
          <span v-if="errors.guest" class="error-message">{{ errors.guest }}</span>
          
          <div v-if="existingReservation" class="existing-rsvp-message">
            <p>We already have your response, but if you'd like to change your details please continue.</p>
          </div>
        </div>

        <WatercolorInput 
          id="email" 
          label="Email Address" 
          v-model="email" 
          type="email" 
          :error="errors.email"
        />

        <WatercolorInput 
          id="phone" 
          label="Phone Number" 
          v-model="phone" 
          type="tel" 
          required
          :error="errors.phone"
        />
        
        

        <button type="submit" class="btn-primary">Submit RSVP</button>
      </form>
    </section>

    <!-- Post-Submission Views -->
    <section v-else class="confirmation-section container text-center">
      <div v-if="showWeekendDetails" class="weekend-details">
        <h2 class="font-script">Wonderful!</h2>
        <p class="text-serif">We look forward to celebrating with you.</p>
        
        <div class="weekend-card">
          <h3 class="font-serif">Weekend Details</h3>
          <p>We would love for you to stay with us for the weekend.</p>
          <p><strong>Accommodation:</strong> On-site glamping is available.</p>
          
          <div v-if="accommodationSelection === null" class="accommodation-options">
            <p>Would you like to book a spot?</p>
            <div class="button-group">
              <button @click="updateAccommodation(true)" class="btn-primary">Yes, please</button>
              <button @click="updateAccommodation(false)" class="btn-secondary">No, thank you</button>
            </div>
          </div>
          
          <div v-else class="accommodation-confirmation">
            <p v-if="accommodationSelection">
              Fantastic! We've marked you down for a spot.
            </p>
            <p v-else>
              No problem. Let us know if you change your mind.
            </p>
            <button @click="accommodationSelection = null" class="btn-secondary">
              Change Selection
            </button>
          </div>
        </div>
      </div>

      <div v-else class="thank-you">
        <h2 class="font-script">Thank You</h2>
        <p class="text-serif">
          We can't wait to see you!
        </p>
        <p class="text-serif">We will be in touch with more details soon.</p>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.home-container {
  min-height: 100vh;
  padding-bottom: 4rem;
  background: linear-gradient(to bottom, var(--color-soft-white) 0%, #eef6f7 100%);
}

.hero-section {
  padding: 4rem 1rem;
  background-image: url('/path/to/watercolor-bg-placeholder.png'); /* To be added */
  background-size: cover;
  background-position: center;
  
  .names {
    font-size: 5rem;
    line-height: 1;
    margin-bottom: 1rem;
    color: black;
  }
  
  .date {
    font-size: 1.5rem;
    letter-spacing: 2px;
    margin: 0.5rem 0;
  }
  
  .venue {
    font-size: 1.2rem;
    font-style: italic;
  }

  .intro-text {
    max-width: 600px;
    margin: 2rem auto;
    font-size: 1.1rem;
  }
}

.rsvp-form {
  max-width: 500px;
  margin: 0 auto;
  background: rgba(255,255,255,0.5);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.watercolor-select {
  width: 100%;
  padding: 0.5rem;
  padding-right: 2rem; /* Make room for custom arrow */
  border: none;
  border-bottom: 2px solid var(--color-sage-green);
  background-color: transparent;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  border-radius: 0; /* Important for iOS */
  
  /* Remove default arrow */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  
  /* Custom Arrow (Forest Green #3a4a3b) */
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233a4a3b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1em;
  
  /* Explicit colors to override iOS defaults */
  color: var(--color-text-primary);
  opacity: 1; /* Fix for disabled placeholder opacity on some browsers */

  &.is-placeholder {
    color: var(--color-sage-green);
    opacity: 1;
  }
  
  &:focus {
    outline: none;
    border-bottom-color: var(--color-forest-green);
  }
}

.weekend-card {
  background: white;
  padding: 2rem;
  margin-top: 2rem;
  border: 1px solid var(--color-sage-green);
  border-radius: 4px;
}

.radio-group {
  margin: 1.5rem 0;
  
  .radio-options {
    display: flex;
    gap: 2rem;
    margin-top: 0.5rem;
    
    label {
      cursor: pointer;
    }
  }
}

.watercolor-label {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--color-forest-green);
  margin-bottom: 0.5rem;
  font-weight: 500;
  display: block;
}

.form-group.has-error {
  .watercolor-select {
    border-bottom-color: #d9534f;
  }
  .watercolor-label {
    color: #d9534f;
  }
}

.error-message {
  font-family: var(--font-serif);
  color: #d9534f;
  font-size: 0.9rem;
  margin-top: 0.25rem;
  font-style: italic;
  display: block;
}

.accommodation-options {
  margin-top: 1.5rem;
  
  p {
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }
}



.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-forest-green);
  border: 1px solid var(--color-forest-green);
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-family: var(--font-serif);
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(58, 74, 59, 0.1);
  }
}

.accommodation-confirmation {
  margin-top: 1.5rem;
  font-weight: 500;
  color: var(--color-forest-green);
}

.existing-rsvp-message {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: var(--color-pale-blue); /* or a soft info color */
  border-radius: 4px;
  border-left: 3px solid var(--color-forest-green);
  
  p {
    margin: 0;
    font-size: 0.9rem;
    font-family: var(--font-serif);
    color: var(--color-forest-green);
    font-style: italic;
  }
}
</style>
