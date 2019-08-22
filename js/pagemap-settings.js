idleTimer = null;
idleState = false;
idleWait = 7000;
pagemapEnabled = false;

function watcher() {
    clearTimeout(idleTimer);
    if(!pagemapEnabled){
        pagemap(document.querySelector('#map', {
            viewport: null, 
                styles: { img: 'rgba(1,0,0)' },
            }));
        pagemapEnabled = true;
    }
    if (idleState == true) {
        document.querySelector("#map").classList.remove("mapfade");
    }
    idleState = false;
    idleTimer = setTimeout(function () {
        document.querySelector("#map").classList.add("mapfade");
        idleState = true; }, idleWait);
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelector('#map').addEventListener('mousemove', watcher);
});


