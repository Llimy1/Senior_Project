// 회원 가입

const form = document.querySelector("#signup-form");
const passwordInput = document.querySelector("#password");
const passwordCheckInput = document.querySelector("#password-check");

// 비밀번호 확인
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
    // sha256으로 비밀번호 암호화
    const sha256Password = sha256(formData.get("password"));
    formData.set("password", sha256Password);

    // 비밀번호 입력과 비밀번호 확인이 일치하면 회원 가입이 가능
    if (checkPassword()) {
        const res = await fetch("/signup", {
            method : "post",
            body : formData
        });
        
        const data = await res.json();

        if (data === "200") {
            // 회원 가입이 성공하면 로그인 화면으로 이동
            window.location.pathname = "login.html";
        }
    } else {
        // 비밀번호와 비밀번호 확인이 틀리면 나오는 애니메이션
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