export interface Guest {
    id: string;
    name: string;
    isWeekendGuest: boolean;
}

export const guests: Guest[] = [
    { id: '1', name: 'Mr J Davies', isWeekendGuest: false },
    { id: '2', name: 'Mr J Fiddler', isWeekendGuest: false },
    { id: '3', name: 'Mrs P Fiddler', isWeekendGuest: false },
    { id: '4', name: 'Mr & Mrs Gorst', isWeekendGuest: true },
    { id: '5', name: 'Mr & Mrs Davies', isWeekendGuest: false },
    { id: '6', name: 'Anna & Sarah', isWeekendGuest: false },
    { id: '7', name: 'Mr & Mrs Spencer', isWeekendGuest: true },
    { id: '8', name: 'Mr & Mrs Griffin', isWeekendGuest: true },
    { id: '9', name: 'Mr & Mrs Lu-Gulyas', isWeekendGuest: false },
    { id: '10', name: 'Mr & Mrs Anderson-Garrett & Family', isWeekendGuest: true },
    { id: '11', name: 'Faith & Tom', isWeekendGuest: true },
    { id: '12', name: 'Mr & Mrs Garrett', isWeekendGuest: true },
    { id: '13', name: 'Andrew, Sarah & Sam Morris', isWeekendGuest: false },
    { id: '14', name: 'Mr & Mrs Morris', isWeekendGuest: false },
    { id: '15', name: 'Mr & Mrs Davies', isWeekendGuest: false },
    { id: '16', name: 'Mr & Mrs McGuckian', isWeekendGuest: false },
    { id: '17', name: 'Mr & Mrs Crowther', isWeekendGuest: true },
    { id: '18', name: 'Mr & Mrs Turner', isWeekendGuest: true },
    { id: '19', name: 'Mr & Mrs Chandler', isWeekendGuest: false },
];