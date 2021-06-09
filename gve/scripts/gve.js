import {mainExample} from './dots.js'


var gv, cm = undefined
var changed = true
var width, height = 0

const render = () => {
  gv
    .width(width)
    .height(height)
    .fit(true)
    .zoom(true)
    .scale(.8)
    .renderDot(cm.getValue());
}

const init = () => {
  document.addEventListener('keydown', d => changed=true)
  const graph = d3.select("#graph")
  const graphBb = graph.node().getBoundingClientRect()
  width = graphBb.width
  height = graphBb.height
  gv = graph.graphviz()
  gv.addImage("./i/airflow.png","150px", "150px")
  gv.addImage("./i/databricks.png","150px", "150px")
  gv.addImage("./i/redshift.png","150px", "150px")
  gv.addImage("./i/s3.png","150px", "150px")
  gv.addImage("./i/spark.png","150px", "150px")
}

const initCM = () => {
 cm = CodeMirror(document.getElementById("editor"), {
  value: mainExample,
  mode:  "dot",
  lineWrapping: true,
  lint: true,
  tabSize: 2,
  indentUnit: 2,
  matchBrackets: true,
 });

 cm.setSize("95%", "80vh")

 cm.on("update", cm => {
  if(changed){
      try {
        render()
      } finally {}
      changed = false
    }
  });
  
  cm.on("keyup", function (cm, event) {
    const tokenTypes = ["tag", "variable"]
    const keyCode = event.keyCode
    const noReturnOrSpace = keyCode != 13 && keyCode != 32
    const cursor = cm.getDoc().getCursor();
    const token = cm.getTokenAt(cursor);
    const tokenControl = tokenTypes.includes(token.type) || token.string == " "
        if (!cm.state.completionActive && noReturnOrSpace && tokenControl ) { 
          CodeMirror.commands.autocomplete(cm, CodeMirror.hint.dot, {completeSingle: false});
        }
      });
  
  
  }

init()
initCM()
render()