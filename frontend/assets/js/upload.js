const upload_form = document.getElementById("upload-form");
const input_upload = document.getElementById("input-file");

// 원본 이미지 Preview
function previewImage() {
    const preview = new FileReader();
    preview.onload = function (e) {
        document.getElementById("origin-image").src = e.target.result;
    };

    preview.readAsDataURL(document.getElementById("input-file").files[0]);
}

// 업로드시 초기화
function reset() {
    const origin_image = document.getElementById("origin-image");
    const detect_image = document.querySelector(".icon-section2 img");
    const detect_text = document.querySelector(".jackpots");

    if (origin_image) {
        origin_image.src = "";
    }

    if (detect_image) {
        detect_image.remove();
    }

    if (detect_text) {
        detect_text.innerText = "";
    }
}

// 이미지 및 문구 출력
const handleUploadForm = async (event) => {
    event.preventDefault();
    reset();
    const body = new FormData(upload_form);

    const icon_section1 = document.querySelector(".icon-section1");
    const icon_section2 = document.querySelector(".icon-section2");

    const container_div1 = document.createElement("div");
    container_div1.className = "loading-container";
    const loading_div1 = document.createElement("div");
    loading_div1.className = "loading";
    const text_div1 = document.createElement("div");
    text_div1.id = "loading-text";
    text_div1.textContent = "loading";

    container_div1.appendChild(loading_div1);
    container_div1.appendChild(text_div1);
    icon_section1.appendChild(container_div1);

    const container_div2 = document.createElement("div");
    container_div2.className = "loading-container";
    const loading_div2 = document.createElement("div");
    loading_div2.className = "loading";
    const text_div2 = document.createElement("div");
    text_div2.id = "loading-text";
    text_div2.textContent = "loading";

    container_div2.appendChild(loading_div2);
    container_div2.appendChild(text_div2);
    icon_section2.appendChild(container_div2);

    try {
        const res = await fetch("/upload", {
            method : "POST",
            body
        });
        const data = await res.json();
        if (data === "200") {
            console.log("업로드 성공");
            icon_section1.removeChild(container_div1);
            icon_section2.removeChild(container_div2);
            const img = document.createElement("img");
            img.id = "origin-image";
            img.src = "#";
            img.alt = "";
            icon_section1.appendChild(img);
            input_upload.onchange(previewImage());
        } 
    } catch(e) {
        console.error(e);
    }
    handlePreviewForm();
    handleText();
};

// Detect 이미지 출력
async function handlePreviewForm() {
    const preview_section = document.querySelector(".icon-section2");
    const img = document.createElement("img");
    const res = await fetch("/detect_image");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    img.src= url;
    preview_section.appendChild(img);
}

// 문구 출력
async function handleText() {
    const detect_image_text = document.querySelector(".jackpots");
    const res = await fetch("/condition");
    const data = await res.json();

    detect_image_text.innerText = data.toUpperCase();
}

// function handleDate() {
//     const detect_image_text = document.querySelector(".jackpots");

//     let today = new Date();

//     let year = today.getFullYear();
//     let month = String(today.getMonth() + 1).padStart(2, "0");
//     let date = String(today.getDate()).padStart(2, "0");
    
//     let hour = String(today.getHours()).padStart(2, "0");
//     let minute = String(today.getMinutes()).padStart(2, "0");
//     let second = String(today.getSeconds()).padStart(2, "0");

//     detect_image_text.innerText = `${year}-${month}-${date} ${hour}:${minute}:${second}`
// }

// handleDate();
// setInterval(handleDate, 1000);


upload_form.addEventListener("submit", handleUploadForm);