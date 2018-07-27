
let file_name = "ASS-S_3";
let on_public_website = new URL(document.location).hostname === "math.mit.edu";

file_name = `json/${file_name}.json`;

if(new URL(document.location).hostname === "math.mit.edu"){
    file_name = "js_spectralsequences/" + file_name;
}

DisplaySseq.fromJSON(file_name)
    .then((dss) => {
        dss.offset_size = 0.5;
        dss.class_scale = 0.7;
        dss.xRange = [0,110];
        dss.yRange = [0, 28];
        dss.initialxRange = [0,40];
        dss.initialyRange = [0,10];
        dss.offset_size = 0.2;
        dss._getXOffset = tools.fixed_tower_xOffset.bind(dss);
        dss._getYOffset = (c) => c.y_offset || 0;

        let sseq = Sseq.getSseqFromDisplay(dss);
        window.dss = dss;
        window.sseq = sseq;
        sseq.addPageToPageList(1);
        sseq.addPageRangeToPageList([3,100]);


        dss.initial_page_idx = 1;

        dss.setPageChangeHandler((page) => {
            if(page === infinity){
                for(let sl of sseq.getStructlines()){
                    sl.visible = true;
                    sseq.updateEdge(sl);
                }
            } else {
                let visible_mults;
                if(page > 2 || page[0] > 2){
                    visible_mults = ["a_0", "h_0", "v_1", "<h_0,h_0,->"];
                } else {
                    visible_mults = ["a_0", "h_0", "<h_0,h_0,->"];
                }

                for(let sl of sseq.getStructlines()){
                    sl.visible = visible_mults.includes(sl.mult);
                    sseq.updateEdge(sl);
                }
            }
        });

        function displayPage(pageRange){
            if(pageRange === infinity){
                return "∞"
            }
            if(pageRange === 1){
                return "2 with no differentials"
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




        for(let c of sseq.classes){
            if(c.permanent_cycle_info && c.getPage() === infinity){
                c.extra_info = `\n\\(${c.permanent_cycle_info}\\)`;
            } else {
                c.extra_info = "";
            }
        }

        for(let d of sseq.getDifferentials()){
            d.addInfoToSourceAndTarget();
        }

        for(let c of sseq.classes){
            c.update();
        }

        // sseq.onDifferentialAdded((d) => {
        //     d.addInfoToSourceAndTarget();
        //     d.source.update();
        //     d.target.update();
        //     d.leibniz(["a_0", "h_0", "<h_0,h_0,->","b"]);
        // });


        tools.install_edit_handlers(dss,"ASS-S_3");


        dss.addKeyHandler("onclick", (event) => {
            if(!event.mouseover_class){
                return;
            }
            let c = sseq.display_class_to_real_class.get(event.mouseover_class);
            let exts = c.getExtensions();
            if(exts.length === 0){
                return;
            }
            let e = exts[0];
            let bend = Number.parseInt(prompt(`Enter bend angle`, e.bend));
            if(bend !== NaN){
                e.bend = bend;
                sseq.update();
            }
        });

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

        let ext_colors = {"3" : "orange", "\\alpha_1" : "purple", "\\beta_1" : "black", "<\\alpha,3,->" : "black", "<\\alpha,\\alpha,->" : "brown"};

        dss.addKeyHandler('t', (event) => {
            if(event.mouseover_class && dss.temp_source_class){
                let s = dss.temp_source_class;
                let t = event.mouseover_class;
                let ext_type = {0 : 3, 4 : "<\\alpha,3,->", 3 : "\\alpha_1", 7 : "<\\alpha,\\alpha,->", 10: "\\beta_1"}[t.x - s.x];
                if(!ext_type){
                    return;
                }
                if(confirm(`Add *${ext_type} extension from ${tools.getClassExpression(s)} to ${tools.getClassExpression(t)}`)){
                    let d = sseq.addExtension(sseq.display_class_to_real_class.get(s), sseq.display_class_to_real_class.get(t));
                    d.color = ext_colors[ext_type];
                    d.mult = ext_type;
                    if(d.mult === "<\\alpha,\\alpha,->"){
                        d.opacity = 0.5;
                    }
                    d.display_edge.mult = ext_type;
                    d.display_edge.color = d.color;
                    sseq.update();
                }
            }
        });


        // dss.addKeyHandler("onclick", (event) => {
        //     if(!event.mouseover_class){
        //         return;
        //     }
        //     let c = event.mouseover_class;
        //     let default_text = "";
        //     if(c.name){
        //         default_text = c.name;
        //     }
        //     let name = prompt(`Enter new name for class at position (${c.x},${c.y})`, default_text);
        //     let real_class = sseq.display_class_to_real_class.get(c);
        //     if(name || name === ""){
        //         real_class.name = name;
        //         real_class.setColor("black");
        //         sseq.updateClass(real_class);
        //         dss.update();
        //     }
        //     c.tooltip_html = undefined;
        //     add_g1_name_if_possible(real_class);
        // });
        //
        // function setPermanentCycleInfo(real_class,str){
        //     real_class.permanent_cycle_info = str;
        //     real_class.display_class.permanent_cycle_info = str;
        //     real_class.addExtraInfo(`\\(${str}\\)`);
        //     real_class.setColor("black");
        //     sseq.updateClass(real_class);
        //     dss.update();
        // }
        //
        // function setPermanentCycleInfoRec(c, str){
        //     if(c.page < infinity){
        //         return;
        //     }
        //     setPermanentCycleInfo(c,str);
        //     let bc = c.getProductIfPresent("b");
        //     if(!bc.isDummy() && !bc.permanent_cycle_info){
        //         setPermanentCycleInfoRec(bc,tools.multiply_monomial("\\beta_{1}",1,str));
        //     }
        //     let ac = c.getProductIfPresent("h_0");
        //     if(!ac.isDummy() && !ac.permanent_cycle_info) {
        //         setPermanentCycleInfoRec(ac, "\\alpha_{1}" + str);
        //     }
        // }
        //
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
        //         real_class.update();
        //
        //         //c.tooltip_html = undefined;
        //         dss.update();
        //     }
        //     c.tooltip_html = undefined;
        //     add_g1_name_if_possible(real_class);
        // });

        dss.display();
    });
