import { getCurrentToken } from "@/app/api/verify-token/route";

export async function verifyTokenServer(token?: string | null){
    if (!token) return false;
    console.log(`${token} === ${await getCurrentToken()}`);

    return token === await getCurrentToken();
}