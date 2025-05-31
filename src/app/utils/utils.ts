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

export const formatPhoneNumber = (phoneNumber: string): string => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length < 10) return phoneNumber;
    
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)} - ${cleaned.substring(6, 10)}`;
};

export const formatIdentityCard = (identityCard: string): string => {
    if (!identityCard) return 'Sin cédula';
    
    const cleaned = identityCard.replace(/\D/g, '');
    
    if (cleaned.length !== 11) return identityCard;
    
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 10)}-${cleaned.substring(10, 11)}`;
};