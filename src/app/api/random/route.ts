import { NextResponse } from 'next/server';
import { BROWSER_HEADERS } from '@/lib/fetcher';

export const dynamic = 'force-dynamic'; 

export async function GET(request: Request) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || request.url;

    try {
        const randomPage = Math.floor(Math.random() * 5) + 1;
    
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.sankavollerei.com'; 
        
        const res = await fetch(`${apiUrl}/anime/animasu/popular?page=${randomPage}`, {
            cache: 'no-store',
            headers: BROWSER_HEADERS,
        });
        
        if (!res.ok) {
            throw new Error(`API nyangkut dengan status: ${res.status}`);
        }

        const data = await res.json();
        
        let animeArray: Record<string, unknown>[] = [];
        
        if (Array.isArray(data)) {
            animeArray = data; 
        } else if (data && typeof data === 'object') {
            if (Array.isArray(data.data)) {
                animeArray = data.data; 
            } else if (Array.isArray(data.popular)) {
                animeArray = data.popular;
            } else if (data.data && Array.isArray(data.data.anime)) {
                animeArray = data.data.anime; 
            } else {
                const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
                if (arrayKey) {
                    animeArray = data[arrayKey];
                }
            }
        }

        if (!animeArray || animeArray.length === 0) {
            console.error("Gagal nemu Array list anime dari data API:", data);
            return NextResponse.redirect(new URL('/', baseUrl));
        }
        const randomIndex = Math.floor(Math.random() * animeArray.length);
        const randomAnime = animeArray[randomIndex];

        if (!randomAnime) {
            return NextResponse.redirect(new URL('/', baseUrl));
        }

        const slug = randomAnime.slug || randomAnime.id;
        
        if (!slug) {
            console.error("Struktur anime ini aneh, ga punya slug/id:", randomAnime);
            return NextResponse.redirect(new URL('/', baseUrl));
        }

        return NextResponse.redirect(new URL(`/anime/${slug}`, baseUrl));

    } catch (error) {
        console.error("Gagal get random anime:", error);
        return NextResponse.redirect(new URL('/', baseUrl));
    }
}