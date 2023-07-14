( /* att_zone : 이미지들이 들어갈 위치 id, btn : file tag id */
    imageView = function imageView(att_zone, btn) {

    let attZone = document.getElementById(att_zone);
    let btnAtt = document.getElementById(btn)
    let sel_files = [];
    
    // 이미지와 체크 박스를 감싸고 있는 div 속성
    let div_style = 'display:inline-block;position:relative;'
                  + 'width:150px;height:120px;margin:5px;border:1px solid #00f;z-index:1';
    // 미리보기 이미지 속성
    let img_style = 'width:100%;height:100%;z-index:none';
    // 이미지안에 표시되는 체크박스의 속성
    let chk_style = 'width:30px;height:30px;position:absolute;font-size:24px;'
                  + 'right:0px;bottom:0px;z-index:999;background-color:rgba(255,255,255,0.1);color:#f00';
  
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
        let img = document.createElement('img')
        img.setAttribute('style', img_style)
        img.src = ee.target.result;
        attZone.appendChild(makeDiv(img, file));
      }
      
      reader.readAsDataURL(file);
    }
    
    /*첨부된 파일이 있는 경우 checkbox와 함께 attZone에 추가할 div를 만들어 반환 */
    makeDiv = function(img, file){
      let div = document.createElement('div')
      div.setAttribute('style', div_style)
      
      let btn = document.createElement('input')
      btn.setAttribute('type', 'button')
      btn.setAttribute('value', 'x')
      btn.setAttribute('delFile', file.name);
      btn.setAttribute('style', chk_style);
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
    
        // Get the 'file-send' button and add a click event listener
    const fileSendButton = document.getElementById("file-send");

    fileSendButton.addEventListener("click", async () => {
      // Create FormData object and append images
      const formData = new FormData();
      for (let file of sel_files) {
        formData.append('images', file);
      }

      // Send the form data to server using fetch
      const response = await fetch('/train', {
        method: 'POST',
        body: formData
      });

      // Handle server response
      if (response.ok) {
        const result = await response.text();
        console.log("Upload successful:", result);

        // Remove all image previews
        const attZone = document.getElementById("att_zone");
        attZone.innerHTML = "";

        // Clear the sel_files array
        sel_files = [];

        // Optionally, reset the input file element
        const btnAtt = document.getElementById("btnAtt");
        btnAtt.value = "";
      } else {
        console.error("Upload failed with status:", response.status);
      }
    });
  }
)('att_zone', 'btnAtt')
