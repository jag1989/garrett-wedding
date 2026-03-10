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
    <div class="main-content">
      <!-- Hero Section -->
      <section class="hero-section text-center">
        <img src="/images/tmp/bird-flourish-1.svg" class="header-flourish bird-1" alt="" />
        <img src="/images/tmp/bird-flourish-2.svg" class="header-flourish bird-2" alt="" />
        <img src="/images/tmp/bird-flourish-3.svg" class="header-flourish bird-3" alt="" />
        <h1 class="names font-script">Katie and Jonathan</h1>
        <div class="details text-serif">
          <p class="date">14th August 2027</p>
          <p class="venue">Dovecote Barns, York</p>
        </div>
      </section>

      <!-- Info Section -->
      <section class="info-section container">
        <h2 class="section-title text-center font-serif">What You Need To Know</h2>
        
        <div class="card-style">
          <div class="info-item">
            <span class="info-label">Ceremony:</span>
            <span class="info-text">All Saints Church, Church End, Cawood, Selby, YO8 3SN - <a href="https://maps.app.goo.gl/YP2Qv3ud4fgrq5az9" target="_blank">Google Maps</a></span>
          </div>

          <div class="info-item">
            <span class="info-label">Venue:</span>
            <span class="info-text">Dovecote Barns, Manor Farm, Kelfield, York, YO19 6RG - <a href="https://maps.app.goo.gl/MCUPMnhB7EFe5oFt7" target="_blank">Google Maps</a></span>
          </div>
          
          <div class="info-item">
            <span class="info-label">Age Policy:</span>
            <span class="info-text">This is a 17+ celebration, with exceptions for immediate family members</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">Timeline:</span>
            <span class="info-text">To follow</span>
          </div>
        </div>
      </section>

      <section class="info-section container">
        <h2 class="section-title text-center font-serif">Register Your Details</h2>

        <div class="card-style">
          <p v-if="!isSubmitted" class="text-center text-serif" style="margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto;">
            Please provide your contact information so we can send you your formal invitation and keep you updated about our special day
          </p>

          <section v-if="!isSubmitted" class="rsvp-section container">
            <!-- RSVP Form -->
            <form @submit.prevent="handleSubmit" novalidate>
              
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
              
              

              <button type="submit" class="btn-primary">Please send me an invitation & keep me updated</button>
            </form>
          </section>

          <!-- Post-Submission Views -->
          <section v-else class="confirmation-section container text-center">
            <div v-if="showWeekendDetails" class="weekend-details">
              <h2 class="font-script">Wonderful</h2>

              <div v-if="accommodationSelection === null" class="accommodation-options">
                <p class="info-text">Would you like the opportunity to stay with us for the weekend?</p>
                <p class="info-text">There are a limited number of spots available, so please let us know if you'd like one. Dovecote Barns has 4 historic award-winning barns, each with 2-4 bedrooms with en-suite bathroom and a shared kitchen priced at <strong>£250 per room</strong> for the weekend (Friday - Monday).</p>
                <p class="info-text">We will provide further weekend plans for those who wish to stay for the weekend. Whilst you do not need to stay until Monday, the price is inclusive of Monday.</p>
                <p class="info-text">We will be allocating the rooms to keep parties together. If you'd like to take a look at the barns, you can do so here: <a href="https://www.dovecotebarnsyork.co.uk/our-accommodation/" target="_blank">Dovecote Barns</a></p>
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

            <div v-else class="thank-you">
              <h2 class="font-script">Wonderful</h2>
              <p class="text-serif">We will be in touch with more details soon</p>
            </div>

          </section>
        </div>
      </section>
    </div> <!-- End main-content -->
    
    <footer class="site-footer"></footer>
  </div>
</template>

<style scoped lang="scss">
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, var(--color-soft-white) 0%, #eef6f7 100%);
}

.main-content {
  flex: 1;
  padding-bottom: 10rem;
  margin: 0 1rem;
  z-index: 1;
}

.site-footer {
  position: fixed;
  bottom: 0;
  z-index: 0;
  width: 100%;
  height: 250px;
  background-image: url('/images/watercolor-forest.png');
  background-size: 400px auto; /* Repeats every 400px as requested */
  background-repeat: repeat-x;
  background-position: center bottom;
  margin-top: auto;
  
  /* Fade out the top of the footer image to blend */
  mask-image: linear-gradient(to top, black 50%, transparent 100%);
  -webkit-mask-image: linear-gradient(to top, black 50%, transparent 100%);
}

.hero-section {
  padding: 6rem 1rem 4rem;
  position: relative; /* For absolute positioning of flourishes */
  background-image: url('/path/to/watercolor-bg-placeholder.png'); /* To be added */
  background-size: cover;
  background-position: center;
  
  .names {
    font-size: 5rem;
    line-height: 1;
    margin-bottom: 1rem;
  }
  
  .header-flourish {
    position: absolute;
    pointer-events: none;
    z-index: 10;
    height: auto;
    /* Removed blend mode as we are fixing the image transparency directly */
  }
  
  .bird-1 {
    top: 2rem;
    right: 15%;
    width: 60px;
    transform: rotate(10deg);
  }
  
  .bird-2 {
    top: 4rem;
    left: 12%; /* Move to left side */
    right: auto;
    width: 55px;
    /* Flip horizontally to face inward if needed, or just rotate */
    transform: scaleX(-1) rotate(15deg); 
  }
  
  .bird-3 {
    top: 6rem;
    right: 8%;
    width: 40px;
    transform: rotate(-5deg);
  }
  
  @media (max-width: 768px) {
    .bird-1 { width: 40px; right: 8%; top: 1rem; }
    .bird-2 { width: 35px; left: 5%; right: auto; top: 2rem; }
    .bird-3 { width: 30px; right: 20%; top: 4rem; }
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

/* Shared Card Styles */
.card-style {
  background-color: rgba(255, 255, 255, 0.95);
  padding: 2.5rem;
  border-radius: 8px;
  box-shadow: 0 10px 30px -5px rgba(58, 74, 59, 0.15); /* Soft, deep green shadow */
  border: 2px solid var(--color-sage-green);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.rsvp-form {
  @extend .card-style;
  margin-top: 2rem;
}

.watercolor-select {
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 0;
  padding-right: 2rem; /* Make room for custom arrow */
  border: none;
  border-bottom: 2px solid var(--color-sage-green);
  background-color: transparent;
  font-size: 1.2rem;
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
  background-color: var(--color-sage-green-light); /* or a soft info color */
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
.bird-accent {
  margin-bottom: 1.5rem;
  
  .bird-img {
    width: 120px;
    height: auto;
    opacity: 0.9;
    mix-blend-mode: multiply; /* Helps it blend like real watercolor */
  }
}

.section-title {
  font-size: 2.2rem;
  color: var(--color-forest-green);
  margin-bottom: 2rem;
}

.info-item {
  margin-bottom: 1.5rem;
  font-family: var(--font-serif);
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--color-text-primary);
  
  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-weight: bold;
  color: var(--color-forest-green);
  margin-right: 0.5rem;
}

.info-text a {
  color: var(--color-forest-green);
  text-decoration: none;
  border-bottom: 2px solid var(--color-sage-green);
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--color-text-primary);
    border-bottom-color: var(--color-forest-green);
  }
}
</style>
