( /* att_zone : 이미지들이 들어갈 위치 id, btn : file tag id */
    imageView = function imageView(att_zone, btn) {

    let attZone = document.getElementById(att_zone);
    let btnAtt = document.getElementById(btn)
    let sel_files = [];
    
 
    btnAtt.onchange = function(e){
      let files = e.target.files;
      let fileArr = Array.prototype.slice.call(files)
      for(f of fileArr){
        imageLoader(f);
      }
    }  
    
  
    // 탐색기에서 드래그앤 드롭 사용
    attZone.addEventListener('dragenter', function(e){
      e.preventDefault();
      e.stopPropagation();
    }, false)
    
    attZone.addEventListener('dragover', function(e){
      e.preventDefault();
      e.stopPropagation();
      
    }, false)
  
    attZone.addEventListener('drop', function(e){
      let files = {};
      e.preventDefault();
      e.stopPropagation();
      let dt = e.dataTransfer;
      files = dt.files;
      for(f of files){
        imageLoader(f);
      }
      
    }, false)
    

    
    /*첨부된 이미리즐을 배열에 넣고 미리보기 */
    imageLoader = function(file){
      sel_files.push(file);
      let reader = new FileReader();
      reader.onload = function(ee){
        let img = document.createElement('img');
        img.id = "imgimg";
        // img.setAttribute('style', img_style)
        img.src = ee.target.result;
        attZone.appendChild(makeDiv(img, file));
      }
      
      reader.readAsDataURL(file);
    }
    
    /*첨부된 파일이 있는 경우 checkbox와 함께 attZone에 추가할 div를 만들어 반환 */
    makeDiv = function(img, file){
      let div = document.createElement('div');
      div.id = "divdiv";
      // div.setAttribute('style', div_style)
      
      let btn = document.createElement('button');
      btn.id = "btnbtn";
      btn.setAttribute('type', 'button');
      btn.setAttribute('value', 'x');
      btn.setAttribute('delFile', file.name);
      // btn.setAttribute('style', chk_style);
      btn.onclick = function(ev){
        let ele = ev.srcElement;
        let delFile = ele.getAttribute('delFile');
        for(let i=0 ;i<sel_files.length; i++){
          if(delFile== sel_files[i].name){
            sel_files.splice(i, 1);      
          }
        }
        
        dt = new DataTransfer();
        for(f in sel_files) {
          let file = sel_files[f];
          dt.items.add(file);
        }
        btnAtt.files = dt.files;
        let p = ele.parentNode;
        attZone.removeChild(p)
      }
      div.appendChild(img)
      div.appendChild(btn)
      return div
    }
    
    // 버튼을 누르면 서버로 이미지 전송
    const fileSendButton = document.getElementById("file-send");

    fileSendButton.addEventListener("click", async () => {
      // Form 데이터 형식으로 이미지를 변환
      const formData = new FormData();
      for (let file of sel_files) {
        formData.append('images', file);
      }

      // fetch를 사용하여 POST 요청으로 서버에 통신
      const response = await fetch('/admin_upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.text();
        console.log("Upload successful:", result);

        // 서버에 전송 후 모든 이미지 삭제
        const attZone = document.getElementById("att_zone");
        attZone.innerHTML = "";

        sel_files = [];

        const btnAtt = document.getElementById("btnAtt");
        btnAtt.value = "";

        Swal.fire(
          "Upload Success !!",
          "학습은 CLICK TO TRAIN 버튼을 눌러주세요.",
          "success"
        );
      } else if (response.status === 400) {
        Swal.fire(
          "Upload Fail !!",
          "이미지를 골라주세요 !",
          "error"
        )
      } else {
          console.error("Upload failed with status:", response.status);
      }
    });
  }
)('att_zone', 'btnAtt')

document.getElementById("train-send").addEventListener("click", function() {
  fetch("/train", {
    method: "GET",
    headers: {
      "Content-Type": "apllication/json",
    },
  })
  .then((response) => response.json())
  .then((data) => {
    if (data === null) {
      console.log(data);
      Swal.fire(
        "Train Fail !!",
        "업로드 후 버튼을 눌러주세요 !",
        "error"
      );
    } else {
      Swal.fire(
        "Train Success",
        "학습 완료!!",
        "success"
      );
    }
    
  })
  .catch((error) => {
    console.error(error);
  });
});