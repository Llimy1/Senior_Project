const form = document.querySelector("#login-form");
const idInput = document.querySelector("#id");
const passwordInput = document.querySelector("#password");


const handleSubmitForm = async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const sha256Password = sha256(formData.get("password"));
    formData.set("password", sha256Password);

    
        const res = await fetch('/login', {
            method : "post",
            body : formData,
        });

        const data = await res.json();
        if (data === "200") {
            window.location.pathname = "camera.html";
        } else if (res.status === 401) {
            idInput.classList.add("shake", "invalid");
            passwordInput.classList.add("shake", "invalid");

            idInput.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
            passwordInput.style.backgroundColor = "rgba(255, 0, 0, 0.2)";

            setTimeout(() => {
                idInput.classList.remove("shake", "invalid");
                passwordInput.classList.remove("shake", "invalid");
                idInput.style.backgroundColor = "";
                passwordInput.style.backgroundColor = "";
            }, 500);
        }

};
form.addEventListener("submit", handleSubmitForm);