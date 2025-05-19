const API_KEY = process.env.NEXT_PUBLIC_RAPID_API_KEY;

export const API_OPTIONS = {
    method: 'GET',
    headers: {
        'x-rapidapi-key': API_KEY ?? "",
        'x-rapidapi-host': 'exercisedb.p.rapidapi.com',
    },
}