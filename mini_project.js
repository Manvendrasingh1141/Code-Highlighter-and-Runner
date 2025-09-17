const import_btn = document.getElementById("input_file");
const copy_btn = document.getElementById("copyBtn");
const download_btn = document.getElementById("downloadBtn");
const run_btn = document.getElementById("runBtn");
const theme_selector = document.getElementById("themeSel");
const lang_selector = document.getElementById("langSel");
const my_code = document.getElementById("my_code");
const live_preview = document.getElementById("highlighted");
const output = document.getElementById("codeOut");
const statu = document.getElementById('status');
const theme_link = document.getElementById("hljs-theme");
const themes = {
  'atom-one-dark':'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css',
  'github':'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css',
  'vs':'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/vs.min.css',
  'monokai':'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/monokai.min.css',
  'solarized-light':'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/solarized-light.min.css'
};

let theme = "atom-one-dark";
let lang = "javascript";
let text = "";
let live_code_text = "";
let loader = false, pyodide;
let result;



async function loadRuntime() {
  statu.textContent = "Loading Python runtime…";
  pyodide = await loadPyodide(); 
  loader = true;
  statu.textContent = "Ready";
}
loadRuntime();

run_btn.onclick = async () => {
  text = my_code.value;
  output.textContent = "";

  if (lang === "javascript") {
    try {
      result = eval(text);
      console.log(result);
      output.textContent = `output: ${result}`;
    } catch (error) {
      output.textContent = "Error Found: " + error.message;
    }
  } 
  else if (lang === "python") {
    if (!loader) {
      output.textContent = "Python runtime not ready yet…";
      return;
    }
    try {
      pyodide.runPython("import sys, io; sys.stdout = io.StringIO()");
      await pyodide.runPythonAsync(text);
      const pyOut = pyodide.runPython("sys.stdout.getvalue()");
      output.textContent = pyOut.trim() || "Executed successfully.";
    } catch (err) {
      output.textContent = "Python Error: " + err;
    }
  }
};


theme_selector.addEventListener("change",(e)=>{
  theme = e.target.value;
  theme_link.href = themes[theme] || themes['atom-one-dark'];
  
})

lang_selector.addEventListener("change",(e)=>{
  lang = e.target.value;
  console.log(lang);
})



copy_btn.addEventListener("click",(e)=>{
  e.preventDefault();
  if(text.trim()!=""){
  navigator.clipboard.writeText(text);
  copy_btn.textContent = "Copied!";
  setTimeout(()=>{
    copy_btn.textContent = "Copy";
  },1000)
}
})


function current_code(){
  my_code.addEventListener("input",(e)=>{
  text = e.target.value;
  live_code_text = e.target.value; 
  live_code(live_code_text);
  })
}

current_code();

function live_code(live_code_text){
  live_preview.textContent = live_code_text;
  live_preview.className = lang;
  hljs.highlightElement(live_preview);
}


// import_btn.addEventListener("change",(e)=>{
//   const file = e.target.files[0];
//   console.log("Selected file:", file.name);
//   if(file){
//     const reader = new FileReader();
//     reader.onload = (ev)=>{
//       my_code = ev.target.result;
//       text = ev.target.result;
//       live_code(text);
//     }
//     reader.readAsText(file);
//   }
// })


import_btn.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) {
    alert("No file selected.");
    return;
  }
  console.log("Selected:", file.name);
  const reader = new FileReader();
  reader.onload = (ev)=>{
    console.log(ev.target.result);
    my_code.textContent = ev.target.value;
    text = ev.target.value;
    live_code(text);
  }
  reader.readAsText(file);
});


download_btn.addEventListener("click",(e)=>{
  if(text.trim()==="")return;
  const link = document.createElement('a');
  const blob = new Blob([text],{type:"text/plain"});
  link.href = URL.createObjectURL(blob);
  link.download = `code.${lang}`;
  link.click();
})

