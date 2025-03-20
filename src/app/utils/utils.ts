export const dayNumberToString = (day: number): string => {
    switch (day) {
        case 1:
            return 'Domingo';
        case 2:
            return 'Lunes';
        case 3:
            return 'Martes';
        case 4:
            return 'Miércoles';
        case 5:
            return 'Jueves';
        case 6:
            return 'Viernes';
        case 7:
            return 'Sábado';
        default:
            return 'Día inválido';
    }
};