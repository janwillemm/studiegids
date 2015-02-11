var CSVBuilder = {
	fields: [],
	csvFile: [],
	seperator: ",",

	createCSVDocument: function(fields, seperator, courses){
		this.fields = fields;
		this.seperator = (seperator) ? seperator : this.seperator;

		var result = this.createCSVHeaderRow() + "\n";

		for(var key in courses){
			var course = courses[key];
			result += this.createCSVRow(course) + "\n";
		}

		return result;

	},

	createCSVHeaderRow : function(){
		var result = "";
		result = this.clean("Vak code")
			+ this.CSVElement("Naam")
			+ this.CSVElement("Programmas")
			+ this.CSVElement("ECTS")
			+ this.CSVElement("HoofdDocent")
			+ this.CSVElement("Co-Docent");

		for(var i = 0; i < this.fields.length; i++){
			result += this.CSVElement(this.fields[i]);
		}

		return result;
	},

	createCSVRow: function(course){

		var opleidingenString = "";
		$.each(course.programs,function(index, object){
			opleidingenString += (index != 0) ? ", " : "" + object.name;
		});

		var result = "";
		result = this.clean(course.code)
			+ this.CSVElement(course.name) 
			+ this.CSVElement(opleidingenString) 
			+ this.CSVElement(course.ects);
		if(course.courseInformation){
			result += 
				this.CSVElement(course.getTeacherInfo(extraCourseLabelsTeacher.hoofdDocent.nl)) 
				+ this.CSVElement(course.getTeacherInfo(extraCourseLabelsTeacher.docent.nl));

			for(var i = 0; i < this.fields.length; i++){
				result += this.CSVElement(course.getLabelInfo(this.fields[i]));
			}
		} else {
			for(var i = 0; i < this.fields.length; i++){
				result += this.CSVElement("");
			}
		}

		return result;

	},

	CSVElement: function(element){
		return this.seperator + this.clean(element);
	},


	clean: function(string){
		if(string == undefined)
			return "";
		var cleanString = string;
		if(Array.isArray(string)){
			cleanString = "";
			for(index in string){
				cleanString += string[index];
			}
		}
		
		cleanString = cleanString.replace(";", " - ");
		// Encode the quotes so they won't collide with csv
		cleanString = cleanString.replace(/\"/g, "&quot;"); 

		// Remove all newlines
		cleanString = cleanString.replace(/\r?\n|\r/g, " ");

		// Add quotes to string
		cleanString = "\"" + cleanString + "\"";

		return cleanString;
	},
}