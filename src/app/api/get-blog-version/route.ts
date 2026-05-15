import { getFirestoreDB } from "@/lib/server/server.firebaseInterface";

export async function POST(req: Request) {
    const { blogId } = await req.json();


    const db = getFirestoreDB();

    const docRef = db.collection("blog-index").doc(blogId);
    const snap = await docRef.get();

    if (!snap.exists) return Response.json({ error: "Blog not found" }, { status: 404 });


    const data = snap.data();

    if (!data || data.published === false) {
        return Response.json({ error: "Blog not found" }, { status: 404 });
    }
    // console.log(blogId, data.version);

    if (typeof data.version !== "number") return Response.json({ version: 0 });

    return Response.json({ version: data.version });
}