export const THEMES = {
    casa: {
        label: 'Cosas de la casa',
        words: [
            'Licuadora', 'Sofá', 'Cama', 'Nevera', 'Espejo',
            'Lámpara', 'Martillo', 'Toalla', 'Reloj', 'Silla'
        ]
    },
    comidas: {
        label: 'Comidas',
        words: [
            'Hamburguesa', 'Pizza', 'Sushi', 'Tacos', 'Pasta',
            'Ensalada', 'Helado', 'Sopa', 'Arroz', 'Filete'
        ]
    }
} as const;

export type ThemeKey = keyof typeof THEMES;
