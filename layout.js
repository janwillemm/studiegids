var Form = function(){
	this.myHTML;
	this.facultyInput;
	this.fieldInputs;
	this.opleidingInputs;

	this.getHTML = function(){
		if(!this.myHTML){
			var form = $("<form>").attr({role:"form"})
			var facultyInput = new FacultyInput([{id: "EWI", name: "EWI"}]);
			this.facultyInput = facultyInput;

			var fieldInputs = new FieldInputs();
			this.fieldInputs = fieldInputs;

			var button = $("<button>").attr({type:"button"}).addClass("btn btn-primary").append("Haal gegevens op");
			$this = this;
			button.click(function(){
				$this.submit();
			})

			var opleidingInputs = new OpleidingInputs();
			this.opleidingInputs = opleidingInputs;

			this.myHTML = form.append(facultyInput.getHTML()).append(opleidingInputs.getHTML()).append(fieldInputs.getHTML()).append(button);

		}
		return this.myHTML;
	}

	this.submit = function(){
		var chosenLabels = [];
		var fields = this.fieldInputs.fields;
		for(var i = 0; i < fields.length; i++){
			var field = fields[i];
			var langs = field.enabledLanguages();
			for(var j = 0; j < langs.length; j++){
				chosenLabels.push(extraCourseLabels[field.id][langs[j]]);
			}
		}

		var fields = this.opleidingInputs.fields;
		var chosenOpleidingen = [];
		for(var i = 0; i < fields.length; i++){
			var field = fields[i];
			if(field.isSelected()){
				chosenOpleidingen.push(field);
			}
		}

		StudyGuideDownloader.startFetching(this.facultyInput.getValue(), chosenOpleidingen, chosenLabels);
	}

}

var FacultyInput = function(faculties){
	this.myHTML;
	this.faculties = faculties;

	// <div class="form-group">
	// 	<label for="FacultySelect">Faculteit</label>
	// 	<select class="form-control" id="faculty">
	// 		<option value="EWI">EWI</option>
	// 	</select>
	// </div>
	this.getHTML = function(){
		if(!this.myHTML){
			var div = $("<div>").addClass("form-group");
			var label = $("<label>").attr({for:"faculty"});
			var select = $("<select>").addClass("form-control").attr({id:faculty});
			var options = [];
			for(var i = 0; i < this.faculties.length; i++){
				var faculty = this.faculties[i];
				var option = $("<option>").attr({value:faculty.id}).append(faculty.name)
				options.push(option);
				select.append(option);
			}
			this.myHTML = div.append(label).append(select);
		}
		return this.myHTML;
	}

	this.getValue = function(){
		var value = this.myHTML.children("select").val();
		return value;
	}
}

var FieldInputs = function(){
	this.myHTML;
	this.fields = [];

	this.getHTML = function(){
		if(!this.myHTML){
			
			// Header
			this.myHTML = $("<div>").addClass("fields-container");

			var header = new FieldInput("Onderdeel", "none");

			header.getHTML().addClass("header");

			var allEngButton = header.englishCheckbox
			var allNLButton = header.dutchCheckbox;

			var $this = this;
			allEngButton.getHTML().click(function(){
				$this.clicked(allEngButton);
			});
			allNLButton.getHTML().click(function(){
				$this.clicked(allNLButton);
			});

			this.myHTML.append(header.getHTML());
			for(key in COURSELABELS){
				var fieldInput = new FieldInput(COURSELABELS[key], key);
				this.fields.push(fieldInput);
				this.myHTML.append(fieldInput.getHTML());
			}
		}
		return this.myHTML;
	};

	this.clicked = function(button){
		for(var i = 0; i < this.fields.length; i++){
			var field = this.fields[i];
			field.setLang(button.text, button.isChecked());
		}
	}
}

// MSC_ES : 76,
// MSC_AM : 13,
// BSC_TI : 12,
// MSC_CS : 15,
// BSC_TW : 28,
// BSC_EE : 11,
// MSC_CE : 14,
// MSC_EE : 16,
// HBO_SCHAKEL: 79,
// MINORS_EWI:103,

var OpleidingInputs = function(){
	this.myHTML;
	this.fields = [];

	this.getHTML = function(){
		if(!this.myHTML){
			var div = $("<div>").addClass("fields-container");
			this.myHTML = div;

			for(key in OPLEIDING){
				var fieldInput = new OpleidingInput(key, OPLEIDING[key]);
				this.fields.push(fieldInput);
				this.myHTML.append(fieldInput.getHTML());
			}

		}

		return this.myHTML;
	}
}

var OpleidingInput = function(name, id){
	this.name = name;
	this.id = id;

	this.myHTML;
	this.checkbox;

	this.getHTML = function(){
		if(!this.myHTML){
			var div = $("<div>").attr({"label-id":this.id}).addClass("form-group field");
			this.checkbox = new inlineLabelCheckbox(this.name);
			this.myHTML = div.append(this.checkbox.getHTML());
		}
		return this.myHTML;
	}

	this.isSelected = function(){
		return this.checkbox.isChecked();
	}
}

var FieldInput = function(name, id){

	this.name = name;
	this.id = id;

	this.myHTML;
	this.englishCheckbox;
	this.dutchCheckbox;

	// <div class="form-group" label-id:"<id>">
	// 	Labelname
	// 	<label class="checkbox-inline">
	// 	  <input type="checkbox" id="inlineCheckbox2" value="option2"> EN
	// 	</label>
	// 	<label class="checkbox-inline">
	// 	  <input type="checkbox" id="inlineCheckbox3" value="option3"> NL
	// 	</label>
	// </div>
	this.getHTML = function(){
		if(!this.myHTML){
			var div = $("<div>").attr({"label-id":this.id}).addClass("form-group field");
			this.englishCheckbox = new inlineLabelCheckbox("EN");
			this.dutchCheckbox = new inlineLabelCheckbox("NL");
			var text = $("<span>").text(this.name);
			this.myHTML = div.append(text).append(this.englishCheckbox.getHTML()).append(this.dutchCheckbox.getHTML());
		}
		return this.myHTML;
	}

	this.enabledLanguages = function(){
		var langs = [];
		if(this.englishCheckbox.isChecked()){
			langs.push("en");
		}
		if(this.dutchCheckbox.isChecked()){
			langs.push("nl");
		}
		return langs;
	}

	this.setLang = function(lang, checked){
		if(lang == "EN"){
			this.englishCheckbox.setChecked(checked);
		}
		else {
			this.dutchCheckbox.setChecked(checked);
		}
	}
}

// var opleidingInput = function(){

// }


var inlineLabelCheckbox = function(text){
	this.myHTML;
	this.text = text;

	// <label class="checkbox-inline">
	//   <input type="checkbox" id="inlineCheckbox1" value="option1"> 1
	// </label>

	this.getHTML = function(){
		if(!this.myHTML){
			var label = $("<label>").addClass("checkbox-inline");
			var checkbox = $("<input>").attr({type: "checkbox", value:this.text});
			this.myHTML = label.append(checkbox).append(text);
		}
		return this.myHTML;
	}

	this.isChecked = function(){
		return this.getHTML().children("input[type='checkbox']").is(":checked");
	}

	this.setChecked = function(checked) {
		if(checked){
			this.getHTML().children("input[type='checkbox']").prop('checked', true);
		}
		else{
			this.getHTML().children("input[type='checkbox']").prop('checked', false);	
		}
	}
}



var Spinner = function(){
	this.myHTML;

	this.getHTML = function(){
		if(!this.myHTML){
			this.myHTML = $('<div>').addClass("center spinner").hide();
		}
		return this.myHTML;
	}

	this.stop = function(){
		this.getHTML().remove();
		this.myHTML = undefined;
	}

	this.start = function(){
		this.getHTML().show();
	}	
}


var ProgramList = function(){
	this.myHTML;
	this.csvDatas = [];
	this.downloadButton;
	this.select;

	this.getHTML = function(){
		if(!this.myHTML){
			var div = $("<div>").addClass("program-list");
			var select = $("<select>").addClass("form-control programList");
			var $this = this;
			select.change(function(){
				var option = $this.select.find(":selected");
				var number = option.val();
				if(number > -1){
					$this.downloadButton.data = $this.csvDatas[number];
					$this.downloadButton.filename = option.text();
					$this.downloadButton.label = option.text();
					$this.downloadButton.show();
				}
				else {
					$this.downloadButton.hide();
				}
				
			});
			this.select = select;

			var emptyOption = $("<option>").attr({value: "-1"}).text("Kies de download");
			select.append(emptyOption);

			var downloadButton = new DownloadButton("", "", "Download!");
			downloadButton.hide();
			this.downloadButton = downloadButton;
			this.myHTML = div.append(select).append(downloadButton.getHTML());
		}
		return this.myHTML;
	}

	this.addProgram = function(name, csvData){
		var position = this.csvDatas.length;
		this.csvDatas[position] = csvData;
		if(name.length > 50){
			name = "..." + name.substr(name.length - 50);
		}
		var option = $("<option>").attr({value: position}).text(name);
		this.select.append(option);
	}


}

var DownloadButton = function(data, filename, label){
	this.myHTML;
	this.data = data;
	this.filename = filename;
	this.label = label;

	//<button type="button" class="btn btn-success">Success</button>
	this.getHTML = function(){
		if(!this.myHTML){
			var button = $("<button>").addClass("btn btn-success downloadButton").text(this.label);
			var div = $("<div>").addClass("downloadButton").append(button);
			var $this = this;
			button.click(function(){
				$this.onClick();
			})
			this.myHTML = div;
		}
		return this.myHTML;
	}

	this.onClick = function(){
		var blob = new Blob([this.data], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, this.filename);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", this.filename);
                link.style = "visibility:hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            else {
            	var encodedUri = encodeURI(csvContent);
				window.open(encodedUri);
            }
        }
	}

	this.hide = function(){
		this.getHTML().hide();
	}

	this.show = function(){
		this.getHTML().show();
	}
}

var RefreshButton = function(){
	this.myHTML;

	this.getHTML = function(){
		if(!this.myHTML){
			var html = $("<button>").addClass("btn btn-warning").text("Refresh").click(function(){
				location.reload();
			});
			this.myHTML = $("<div>").append(html);
		}

		return this.myHTML;
	}
}