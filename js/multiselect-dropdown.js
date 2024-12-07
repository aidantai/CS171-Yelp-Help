// Create and append the custom styles
var style = document.createElement('style');
style.setAttribute("id","multiselect_dropdown_styles");
style.innerHTML = `
.multiselect-dropdown{
  display: inline-block;
  padding: 2px 5px 0px 5px;
  border-radius: 4px;
  border: solid 1px #ced4da;
  background-color: white;
  position: relative;
  background-repeat: no-repeat;
  background-position: right .75rem center;
  background-size: 16px 12px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  alignment: left;
}
.multiselect-dropdown span.optext, .multiselect-dropdown span.placeholder{
  margin-right:0.5em; 
  margin-bottom:2px;
  padding:1px 0; 
  border-radius: 4px; 
  display:inline-block;
}
.multiselect-dropdown span.optext{

  padding:1px 0.75em; 
}
.multiselect-dropdown span.optext .optdel {
  float: right;
  margin: 0 -6px 1px 5px;
  font-size: 0.7em;
  margin-top: 2px;
  cursor: pointer;
  color: #666;
}
.multiselect-dropdown span.optext .optdel:hover { color: #c66;}
.multiselect-dropdown span.placeholder{
  color:#ced4da;
}
.multiselect-dropdown-list-wrapper{
  box-shadow: gray 0 3px 8px;
  z-index: 100;
  padding:2px;
  border-radius: 4px;
  border: solid 1px #ced4da;
  display: none;
  margin-top: 5px; /* Adjusted for better spacing */
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
}
.multiselect-dropdown-list-wrapper .multiselect-dropdown-search{
  margin-bottom:5px;
  width: 100%;
  box-sizing: border-box;
}
.multiselect-dropdown-list{
  padding:2px;
  max-height: 15rem;
  overflow-y:auto;
  overflow-x: hidden;
}
.multiselect-dropdown-list::-webkit-scrollbar {
  width: 6px;
}
.multiselect-dropdown-list::-webkit-scrollbar-thumb {
  background-color: #bec4ca;
  border-radius:3px;
}

.multiselect-dropdown-list div{
  padding: 5px;
  text-align: left; /* Ensures left alignment */
}
.multiselect-dropdown-list input{
  height: 1.15em;
  width: 1.15em;
  margin-right: 0.35em;  
}
.multiselect-dropdown-list div.checked{

}
.multiselect-dropdown-list div:hover{
  background-color: #ced4da;
}
.multiselect-dropdown span.maxselected {width:100%;}
.multiselect-dropdown-all-selector {border-bottom:solid 1px #999;}
`;

document.head.appendChild(style);

// MultiselectDropdown Function
function MultiselectDropdown(options){
  var config={
    search:true,
    height:'15rem',
    placeholder:'select',
    txtSelected:'selected',
    txtAll:'All',
    txtRemove: 'Remove',
    txtSearch:'search',
    ...options
  };

  function newEl(tag,attrs){
    var e=document.createElement(tag);
    if(attrs!==undefined) Object.keys(attrs).forEach(k=>{
      if(k==='class') {
        Array.isArray(attrs[k]) ?
            attrs[k].forEach(o=>o!==''?e.classList.add(o):0) :
            (attrs[k]!==''?e.classList.add(attrs[k]):0)
      }
      else if(k==='style'){
        Object.keys(attrs[k]).forEach(ks=>{
          e.style[ks]=attrs[k][ks];
        });
      }
      else if(k==='text'){e.innerText=attrs[k]}
      else e[k]=attrs[k];
    });
    return e;
  }

  document.querySelectorAll("select[multiple]").forEach((el,k)=>{
    var div=newEl('div',{
      class:'multiselect-dropdown',
      style:{
        width:config.style?.width ?? el.clientWidth + 'px',
        padding:config.style?.padding ?? ''
      }
    });
    el.style.display='none';
    el.parentNode.insertBefore(div, el.nextSibling);

    var listWrap=newEl('div',{class:'multiselect-dropdown-list-wrapper'});
    var list=newEl('div',{class:'multiselect-dropdown-list', style:{height:config.height}});

    var search = newEl('input',{
      class:['multiselect-dropdown-search'].concat([config.searchInput?.class ?? 'form-control']),
      style:{
        width:'100%',
        display:el.getAttribute('multiselect-search') === 'true' ? 'block' : 'none'
      },
      placeholder:config.txtSearch
    });

    listWrap.appendChild(search);
    listWrap.appendChild(list);
    div.appendChild(listWrap);

    // Load Options Function
    el.loadOptions = () => {
      list.innerHTML = '';

      if(el.getAttribute('multiselect-select-all') === 'true'){
        var op = newEl('div',{class:'multiselect-dropdown-all-selector'});
        var ic = newEl('input',{type:'checkbox'});
        op.appendChild(ic);
        op.appendChild(newEl('label',{text:config.txtAll}));

        op.addEventListener('click', (e) => {
          if(e.target.tagName.toLowerCase() !== 'input') {
            ic.checked = !ic.checked;
            op.classList.toggle('checked', ic.checked);
            list.querySelectorAll(":scope > div:not(.multiselect-dropdown-all-selector)")
                .forEach(i => {
                  if(i.style.display !== 'none'){
                    i.querySelector("input").checked = ic.checked;
                    i.optEl.selected = ic.checked
                  }
                });
            el.dispatchEvent(new Event('change'));
          }
        });
        ic.addEventListener('click', (ev) => {
          ev.stopPropagation(); // Prevent event from bubbling up to parent
          ic.checked = !ic.checked;
          op.classList.toggle('checked', ic.checked);

          var ch = ic.checked;
          list.querySelectorAll(":scope > div:not(.multiselect-dropdown-all-selector)")
              .forEach(i => {
                if(i.style.display !== 'none'){
                  i.querySelector("input").checked = ch;
                  i.optEl.selected = ch
                }
              });
          el.dispatchEvent(new Event('change'));
        });
        el.addEventListener('change', (ev) => {
          let itms = Array.from(list.querySelectorAll(":scope > div:not(.multiselect-dropdown-all-selector)")).filter(e => e.style.display !== 'none');
          let existsNotSelected = itms.find(i => !i.querySelector("input").checked);
          if(ic.checked && existsNotSelected) {
            ic.checked = false;
          }
          else if(!ic.checked && !existsNotSelected) {
            ic.checked = true;
          }
        });

        list.appendChild(op);
      }

      Array.from(el.options).forEach(o => {
        var op = newEl('div',{class:o.selected ? 'checked' : '', optEl: o});
        var ic = newEl('input',{type:'checkbox', checked:o.selected});
        op.appendChild(ic);
        op.appendChild(newEl('label',{text:o.text}));

        op.addEventListener('click', (e) => {
          if(e.target.tagName.toLowerCase() !== 'input') {
            ic.checked = !ic.checked;
            op.classList.toggle('checked', ic.checked);
            o.selected = ic.checked;
            el.dispatchEvent(new Event('change'));
            div.refresh();
          }
        });
        ic.addEventListener('click', (ev) => {
          ev.stopPropagation(); // Prevent event from bubbling up to parent
          ic.checked = !ic.checked;
          op.classList.toggle('checked', ic.checked);
          o.selected = ic.checked;
          el.dispatchEvent(new Event('change'));
          div.refresh();
        });
        o.listitemEl = op;
        list.appendChild(op);
      });
      div.listEl = listWrap;

      div.refresh = () => {
        div.querySelectorAll('span.optext, span.placeholder').forEach(t => div.removeChild(t));
        var sels = Array.from(el.selectedOptions);
        if(sels.length > (el.getAttribute('multiselect-max-items') ? parseInt(el.getAttribute('multiselect-max-items')) : 5)){
          div.appendChild(newEl('span',{class:['optext','maxselected'], text:sels.length + ' ' + config.txtSelected}));
        }
        else{
          sels.forEach(x => {
            var c = newEl('span',{
              class:'optext',
              text:x.text,
              srcOption: x
            });
            if(el.getAttribute('multiselect-hide-x') !== 'true') {
              var closeBtn = newEl('span',{
                class:'optdel',
                text:'x',
                title:config.txtRemove,
                onclick:(ev) => {
                  x.listitemEl.dispatchEvent(new Event('click'));
                  div.refresh();
                  ev.stopPropagation();
                }
              });
              c.appendChild(closeBtn);
            }
            div.appendChild(c);
          });
        }
        if(el.selectedOptions.length === 0) {
          div.appendChild(newEl('span',{class:'placeholder', text:el.getAttribute('placeholder') || config.placeholder}));
        }
      };
      div.refresh();
    }
    el.loadOptions();

    // Search Functionality
    search.addEventListener('input', () => {
      const filter = search.value.toUpperCase();
      list.querySelectorAll(":scope div:not(.multiselect-dropdown-all-selector)").forEach(d => {
        const txt = d.querySelector("label").innerText.toUpperCase();
        d.style.display = txt.includes(filter) ? 'block' : 'none';
      });
    });

    // Toggle Dropdown Visibility
    div.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent event from bubbling up
      const isVisible = listWrap.style.display === 'block';
      document.querySelectorAll('.multiselect-dropdown-list-wrapper').forEach(lw => lw.style.display = 'none');
      if(!isVisible){
        listWrap.style.display = 'block';
        search.focus();
        search.select();
      }
      div.refresh();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      if (!div.contains(event.target)) {
        listWrap.style.display = 'none';
        div.refresh();
      }
    });
  });
}

// Initialize the Multiselect Dropdown on window load
window.addEventListener('load', () => {
  MultiselectDropdown(window.MultiselectDropdownOptions);
});