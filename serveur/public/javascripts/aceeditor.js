/**
 * Global variable to store the ids of the status of the current dragged ace editor.
 */
window.draggingAceEditor = {};

function makeAceEditorResizable(editor){
    var id_editor = editor.container.id;
    var id_dragbar = id_editor + '_dragbar';
    var id_wrapper =  id_editor + '_wrapper';
    var wpoffset = 0;
    window.draggingAceEditor[id_editor] = false;

    var action_mousedown = function(e) {
        e.preventDefault();

        window.draggingAceEditor[id_editor] = true;

        // Set editor opacity to 0 to make transparent so our wrapper div shows
        document.getElementById(id_editor).style.opacity = 0;
    
        document.addEventListener("mousemove", action_document_mousemove);
    };

    var action_document_mousemove = function(e){
        var _editor = document.getElementById(id_editor);
        var rect = _editor.getBoundingClientRect();

        var rsl = {
            top: rect.top + document.body.scrollTop
        };

        var top_offset = rsl.top - wpoffset;

        var actualY = e.pageY - wpoffset;

        // editor height
        var eheight = actualY - top_offset;
        
        // Set wrapper height
        document.getElementById(id_wrapper).style.height = eheight;
        
        // Set dragbar opacity while dragging (set to 0 to not show)
        document.getElementById(id_dragbar).style.opacity =  0.15;
    };

    document.getElementById(id_dragbar).addEventListener("mousedown", action_mousedown);
 
    var action_mouseup = function(e){
        if (window.draggingAceEditor[id_editor])
        {
            var ctx_editor = document.getElementById(id_editor);
            
            var rect = ctx_editor.getBoundingClientRect();

            var rsl = {
                top: rect.top + document.body.scrollTop
            };

            var actualY = e.pageY - wpoffset;
            var top_offset = rsl.top - wpoffset;
            var eheight = actualY - top_offset;
            
            document.removeEventListener("mousemove", action_document_mousemove);
            
            // Set dragbar opacity back to 1
            document.getElementById(id_dragbar).style.opacity = 1;
            
            // Set height on actual editor element, and opacity back to 1
            ctx_editor.style.height = eheight + "px";
            ctx_editor.style.opacity = 1;
            
            // Trigger ace editor resize()
            editor.resize();

            window.draggingAceEditor[id_editor] = false;
        }
    };

    document.addEventListener("mouseup", action_mouseup);
}