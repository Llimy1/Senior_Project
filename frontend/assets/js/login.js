// 로그인

const form = document.querySelector("#login-form");
const idInput = document.querySelector("#id");
const passwordInput = document.querySelector("#password");

const handleSubmitForm = async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    // sha256을 사용하여 암호화
    const sha256Password = sha256(formData.get("password"));
    formData.set("password", sha256Password);

    // fetch를 사용하여 POST 요청으로 로그인
    const res = await fetch('/login', {
        method : "post",
        body : formData,
    });

    const data = await res.json();
    if (data === "200") {
        // 로그인이 완료되면 CCTV 화면으로 이동
        window.location.pathname = "camera.html";
    } else if (data === "210") {
        // 관리자로 로그인을 하면 학습 데이터를 올릴 수 있는 Train 화면으로 이동
        window.location.pathname = "admin.html";
    } else if (res.status === 401) {
        // 아이디와 비밀번호가 일치하지 않았을 때 애니메이션
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