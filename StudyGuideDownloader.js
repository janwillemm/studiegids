var StudyGuideDownloader = {
	form : {},
	spinner : {},


	init : function(){
		Logger.useDefaults();
		Logger.setHandler(function (messages, context) {
			var logger = $("div.logger");
			logger.append(messages[0]);
			logger.append("<br />");
  			logger.scrollTop(logger[0].scrollHeight);
		}); 

		this.form = new Form();


		this.spinner = new Spinner();
		this.spinner.stop();

		$("body").append(this.form.getHTML()).append(this.spinner.getHTML());
	},

	startFetching : function(faculty, opleidingen, fields){
		this.spinner.start();

		var opleidingenString = "";
		$.each(opleidingen,function(index, object){
			opleidingenString += ", " + object.name;
		});

		Logger.info("======================================");
		Logger.info("De data wordt geladen. De gekozen onderdelen zijn:");
		Logger.info("Faculteit: " + faculty);
		Logger.info("Opleidingen: " + opleidingenString);
		Logger.info("Velden: " + fields);
		Logger.info("======================================");

		// Just get rid of the form.
		this.form.getHTML().empty();

		studiegids.useData(EWIDATARESPONSE);
		studiegids.faculty = faculty;
		studiegids.opleidingen = opleidingen;
		studiegids.fields = fields;

		// Parse the data.
		studiegids.parse();
	},

	csvData : function(courseData, fields){
		this.spinner.stop();

		console.log(courseData);
		var csvContent = CSVBuilder.createCSVDocument(fields, ",", courseData.courses);
		
		var programList = new ProgramList();

		$("body").append(programList.getHTML());
		programList.addProgram("Alle vakken", csvContent);

		for(var key in courseData.programs){
			var program = courseData.programs[key];
			var csvContent = CSVBuilder.createCSVDocument(fields, ",", program.courses);

			programList.addProgram(program.name, csvContent);
		}

		if(courseData.errorCourses){
			Logger.info("===========================");
			Logger.info("===========================");
			Logger.info("Let op, sommigge courses werden niet geladen!")
			Logger.info("Dit zijn:");
			for(key in courseData.errorCourses){
				Logger.info("" + courseData.errorCourses[key].code + " - " + courseData.errorCourses[key].name);
			}
			Logger.info("===========================");
			Logger.info("===========================");

		}
		Logger.info("");

		$("body").append("<br />").append(new RefreshButton().getHTML());
	
	}

}
