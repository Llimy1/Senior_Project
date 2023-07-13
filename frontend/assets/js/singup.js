const form = document.querySelector("#signup-form");
const passwordInput = document.querySelector("#password");
const passwordCheckInput = document.querySelector("#password-check");

const checkPassword = () => {
    const formData = new FormData(form);
    const password = formData.get("password");
    const passwordCheck = formData.get("password-check");

    if (password === passwordCheck) {
        return true;
    } else return false;
}

const handleSubmitForm = async (event) => {

    event.preventDefault();
    const formData = new FormData(form);
    const sha256Password = sha256(formData.get("password"));
    formData.set("password", sha256Password);

    if (checkPassword()) {
        const res = await fetch("/signup", {
            method : "post",
            body : formData
        });
        
        const data = await res.json();

        if (data === "200") {
            window.location.pathname = "login.html";
        }
    } else {
        passwordInput.classList.add("shake", "invalid");
        passwordCheckInput.classList.add("shake", "invalid");

        passwordInput.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
        passwordCheckInput.style.backgroundColor = "rgba(255, 0, 0, 0.2)";

        setTimeout(() => {
            passwordInput.classList.remove("shake", "invalid");
            passwordCheckInput.classList.remove("shake", "invalid");
            passwordInput.style.backgroundColor = "";
            passwordCheckInput.style.backgroundColor = "";
        }, 500);
    }
}


form.addEventListener("submit", handleSubmitForm);