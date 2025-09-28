"use client";

import Cookies from "js-cookie";

async function badToken() {
	window.location.href = "/login";
}

export async function verifyToken(){
	const token = Cookies.get("token");
	if (!token){ 
		await badToken();
		return false;
	}
	const res = await fetch("/api/verify-token", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ token }),
	});
	if (!res.ok){ 
		await badToken();
		return false;
	}
	return true;
}
