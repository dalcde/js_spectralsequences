"use strict";


let file_name = "ASS-S_2";
let on_public_website = new URL(document.location).hostname === "math.mit.edu";



file_name = `json/${file_name}.json`;
if(new URL(document.location).hostname === "math.mit.edu"){
    file_name = "js_spectralsequences/" + file_name;
}

DisplaySseq.fromJSON(file_name).catch((error) => console.log(error)).then((dss) => {
    dss.xRange = [0,70];
    dss.yRange = [0, 40];
    window.dss = dss;
    window.sseq = Sseq.getSseqFromDisplay(dss);
    dss.offset_size = 0.2;
    dss._getXOffset = tools.fixed_tower_xOffset.bind(dss);
    dss._getYOffset = (c) => c.y_offset || 0;

    function displayPage(pageRange){
        if(pageRange === infinity){
            return "∞";
        }
        if(pageRange === 0){
            return "2 with all differentials";
        }
        if(pageRange === 1){
            return "2 with no differentials";
        }
        if(pageRange.length){
            return `${pageRange[0]} – ${pageRange[1]}`.replace(infinity,"∞");
        }
        return pageRange;
    }

    dss.on_draw = (display) =>  {
        let context = display.supermarginLayerContext;
        // page number
        context.clearRect(50,0,400,200);
        context.font = "15px Arial";
        context.fillText(`Page ${displayPage(display.pageRange)}`,100,12);
    };

    if(on_public_website){
        dss.display();
        return;
    }


    tools.install_edit_handlers(dss,"ASS-S_2");

    dss.addKeyHandler("onclick", (event) => {
        if(!event.mouseover_class){
            return;
        }
        let c = sseq.display_class_to_real_class.get(event.mouseover_class);
        let x_offset = Number.parseFloat(prompt(`x nudge ${c.name}`));
        if(x_offset){
            let old_x_offset = c.x_offset || (dss._getXOffset(c.display_class)/dss.offset_size);
            c.x_offset = old_x_offset + x_offset;
        }

        let y_offset = Number.parseFloat(prompt(`y nudge ${c.name}`));
        if(y_offset){
            let old_y_offset = c.y_offset || (dss._getYOffset(c.display_class)/dss.offset_size);
            c.y_offset = old_y_offset + y_offset;
        }
        console.log(c.x_offset);
        console.log(c.y_offset);
        sseq.update();
    });

    // dss.addKeyHandler("onclick", (event) => {
    //     if(!event.mouseover_class){
    //         return;
    //     }
    //     let c = event.mouseover_class;
    //     let default_text = "";
    //     if(c.permanent_cycle_info){
    //         default_text = c.permanent_cycle_info;
    //     }
    //     let permanent_cycle_info = prompt(`Enter permanent cycle info for class ${c.name} in position (${c.x},${c.y})`, default_text);
    //     let real_class = sseq.display_class_to_real_class.get(c);
    //     if(permanent_cycle_info || permanent_cycle_info === ""){
    //         real_class.permanent_cycle_info = permanent_cycle_info;
    //         c.permanent_cycle_info = permanent_cycle_info;
    //         real_class.extra_info = `\n\\(${permanent_cycle_info}\\)`;
    //         sseq.update();
    //     }
    //     c.tooltip_html = undefined;
    // });

    // dss.addKeyHandler("onclick", (event) => {
    //     if(!event.mouseover_class){
    //         return;
    //     }
    //     let c = sseq.display_class_to_real_class.get(event.mouseover_class);
    //     let exts = c.getExtensions();
    //     if(exts.length === 0){
    //         return;
    //     }
    //     let e = exts[0];
    //     let bend = Number.parseInt(prompt(`Enter bend angle`, e.bend));
    //     if(bend !== NaN){
    //         e.bend = bend;
    //         sseq.update();
    //     }
    // });

    let ext_colors = {"2" : "orange", "\\eta" : "purple", "\\nu" : "brown"}

    dss.addKeyHandler('e', (event) => {
        if(event.mouseover_class && dss.temp_source_class){
            let s = dss.temp_source_class;
            let t = event.mouseover_class;
            let ext_type = {0 : 2, 1 : "\\eta", 3: "\\nu"}[t.x - s.x];
            if(!ext_type){
                return;
            }
            if(confirm(`Add *${ext_type} extension from ${tools.getClassExpression(s)} to ${tools.getClassExpression(t)}`)){
                let d = sseq.addExtension(sseq.display_class_to_real_class.get(s), sseq.display_class_to_real_class.get(t));
                d.color = ext_colors[ext_type];
                d.mult = ext_type;
                d.display_edge.mult = ext_type;
                d.display_edge.color = d.color;
                sseq.update();
            }
        }
    });



    dss.display();
});
