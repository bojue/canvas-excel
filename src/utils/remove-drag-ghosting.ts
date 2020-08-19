let removeDragGhosting  = function(event:DragEvent) {
    if(!(event instanceof MouseEvent)) {
        console.info("Parameters must be of type MouseEvent!")
        return;
    }
    let dragIcon = document.createElement('img');
    let url = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    dragIcon.src = url;
    dragIcon.width = 0;
    dragIcon.height = 0;
    // dragIcon.opacity = 0;
    event.dataTransfer &&  event.dataTransfer.setDragImage(dragIcon,0, 0);
}

export default removeDragGhosting;