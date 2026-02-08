export interface Guest {
    id: string;
    name: string;
    isWeekendGuest: boolean;
}

export const guests: Guest[] = [
    { id: '1', name: 'Mr J Davies', isWeekendGuest: false },
    { id: '2', name: 'Mr J Fiddler', isWeekendGuest: false },
    { id: '3', name: 'Mrs P Fiddler', isWeekendGuest: false },
    { id: '4', name: 'Mr N & Mrs T Gorst', isWeekendGuest: true },
    { id: '5', name: 'Mr B & Mrs D Davies', isWeekendGuest: true },
    { id: '6', name: 'Mrs S & Mrs S Anderson-Garrett & Family', isWeekendGuest: true },
    { id: '7', name: 'Miss F Garrett & Mr T Garvey', isWeekendGuest: true },
    { id: '8', name: 'Mr C & Mrs G Garrett', isWeekendGuest: true },
    { id: '9', name: 'Mr A & Mrs S Morris', isWeekendGuest: false },
    { id: '10', name: 'Mr G & Mrs B Morris', isWeekendGuest: false },
    { id: '11', name: 'Mr W & Mrs A Chandler', isWeekendGuest: false },
    { id: '12', name: 'Mr J & Mrs R Davies', isWeekendGuest: false },
    { id: '13', name: 'Mr P & Mrs A McGuckian', isWeekendGuest: true },
    { id: '14', name: 'Mr E & Mrs L Crowther', isWeekendGuest: true },
    { id: '15', name: 'Mr C & Mrs L Turner', isWeekendGuest: true },
    { id: '16', name: "Mrs A Fletcher & Mrs S O'Donnell", isWeekendGuest: true },
    { id: '17', name: 'Mr A & Mrs A Spencer', isWeekendGuest: true },
    { id: '18', name: 'Mr J & Mrs M Griffin', isWeekendGuest: true },
    { id: '19', name: 'Mr Z & Mrs V Lu-Gulyas', isWeekendGuest: false },
];