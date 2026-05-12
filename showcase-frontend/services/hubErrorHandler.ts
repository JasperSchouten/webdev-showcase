export function handleHubError(err: any) {
    const message = err?.message ?? String(err);

    console.log("Hub error:", err);

    if (
        message.includes("Unauthorized") ||
        message.includes("401") ||
        message.includes("not authorized")
    ) {
        alert("You need to be logged in to do that.");

        setTimeout(() => {
            window.location.href = "/login";
        }, 800);

        return;
    }

    alert(message);
}