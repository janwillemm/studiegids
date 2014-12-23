
var Form = function(){
	this.myHTML;
	this.facultyInput;
	this.fieldInputs;

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

			this.myHTML = form.append(facultyInput.getHTML()).append(fieldInputs.getHTML()).append(button);

		}
		return this.myHTML;
	}

	this.submit = function(){
		console.log(this.facultyInput.getValue());
		
		var chosenLabels = [];
		var fields = this.fieldInputs.fields;
		for(var i = 0; i < fields.length; i++){
			var field = fields[i];
			var langs = field.enabledLanguages();
			for(var j = 0; j < langs.length; j++){
				console.log(extraCourseLabels[field.id]);
				chosenLabels.push(extraCourseLabels[field.id][langs[j]]);
			}
		}

		studiegids.useData(EWIDATARESPONSE);
		studiegids.faculty = this.facultyInput.getValue();
		// Set studiegids opleiding TODO
		studiegids.fields = chosenLabels;
		studiegids.parse();

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