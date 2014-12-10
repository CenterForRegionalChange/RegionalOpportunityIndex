// JavaScript Document
//drop down menu
$( document ).ready(function() {
$('#cssmenu').prepend('<div id="menu-button">Putting Youth<br> on the Map (PYOM)</div>');
	$('#cssmenu #menu-button').on('click', function(){
		var menu = $(this).next('ul');
		if (menu.hasClass('open')) {
			menu.removeClass('open');
		}
		else {
			menu.addClass('open')
		}
	});

//end drop down menu

//about
$('#faculty').click(function(){
		//change text
		$('#faculty1').slideToggle();
	});
$('#students').click(function(){
		//change text
		$('#students1').slideToggle();
	});
$('#staff').click(function(){
		//change text
		$('#staff1').slideToggle();
	});
$('#anr').click(function(){
		//change text
		$('#anr1').slideToggle();
	});


//

//start learn js
//Module 1
$('#modF').click(function(){
		//show text
		$('#mF').toggle();
	});


$('#modF').click(function(){
		//change color
		$('#modF').css('color', '#c99700');
	});

		

	
//Module 2
$('#modS').click(function(){
		//show text
		$('#mS').toggle();
	});
$('#modS').click(function(){
		//change color
		$('#modS').css('color', '#c99700');
	});
	
//Module 3
$('#modT').click(function(){
		//show text
		$('#mT').toggle();
	});
$('#modT').click(function(){
		//change color
		$('#modT').css('color', '#c99700');
	});

//end learn js

//Navigate js below


	$('#pre').click(function(){
		//change text
		$('#prez').toggle();
	});

	$('#preN').click(function(){
		//change text
		$('#prezN').toggle();
	});
	
	
//end learn js

//start equity show/hide

$('#one').click(function(){
		//show text
		$('#oneE').toggle();
	});
$('#two').click(function(){
		//show text
		$('#twoE').toggle();
	});
$('#three').click(function(){
		//show text
		$('#threeE').toggle();
	});
$('#four').click(function(){
		//show text
		$('#fourE').toggle();
	});
$('#five').click(function(){
		//show text
		$('#fiveE').toggle();
	});
$('#six').click(function(){
		//show text
		$('#sixE').toggle();
	});
$('#seven').click(function(){
		//show text
		$('#sevenE').toggle();
	});
$('#eight').click(function(){
		//show text
		$('#eightE').toggle();
	});
$('#nine').click(function(){
		//show text
		$('#nineE').toggle();
	});
$('#ten').click(function(){
		//show text
		$('#tenE').toggle();
	});
$('#eleven').click(function(){
		//show text
		$('#elevenE').toggle();
	});

//equity

//slide


//data below

// JavaScript Document

//PANEL 1 - YWI
	//main
$('#YWI').click(function(){
		//change text
		$('#YWIbody').slideToggle();
	});	
$('#1').click(function(){
		//change text
		$('#1body').toggle();
	});
$('#1a').click(function(){
		//change text
		$('#1abody').toggle();
	});
$('#1b').click(function(){
		//change text
		$('#1bbody').toggle();
	});
$('#1c').click(function(){
		//change text
		$('#1cbody').toggle();
	});
$('#12').click(function(){
		//change text
		$('#12body').toggle();
	});
$('#12a').click(function(){
		//change text
		$('#12abody').toggle();
	});
$('#12b').click(function(){
		//change text
		$('#12bbody').toggle();
	});
$('#12c').click(function(){
		//change text
		$('#12cbody').toggle();
	});
$('#12d').click(function(){
		//change text
		$('#12dbody').toggle();
	});
$('#13').click(function(){
		//change text
		$('#13body').toggle();
	});
$('#13a').click(function(){
		//change text
		$('#13abody').toggle();
	});
$('#13b').click(function(){
		//change text
		$('#13bbody').toggle();
	});
$('#13c').click(function(){
		//change text
		$('#13cbody').toggle();
	});
$('#13d').click(function(){
		//change text
		$('#13dbody').toggle();
	});
$('#13e').click(function(){
		//change text
		$('#13ebody').toggle();
	});
$('#14').click(function(){
		//change text
		$('#14body').toggle();
	});
$('#14a').click(function(){
		//change text
		$('#14abody').toggle();
	});
$('#14b').click(function(){
		//change text
		$('#14bbody').toggle();
	});
$('#15').click(function(){
		//change text
		$('#15body').toggle();
	});
$('#click1').click(function(){
		//change text
		$('#clicked1').toggle();
	});
$('#click2').click(function(){
		//change text
		$('#povertyInfo').toggle();
	});
$('#click3').click(function(){
		//change text
		$('#dropoutInfo').toggle();
	});
	

//PANEL 2 - YWI
	//main
$('#YVI').click(function(){
		//change text
		$('#YVIbody').slideToggle();
	});
$('#2a').click(function(){
		//change text
		$('#2abody').toggle();
	});
$('#2b').click(function(){
		//change text
		$('#2bbody').toggle();
	});
$('#2c').click(function(){
		//change text
		$('#2cbody').toggle();
	});
$('#2d').click(function(){
		//change text
		$('#2dbody').toggle();
	});
$('#2e').click(function(){
		//change text
		$('#2ebody').toggle();
	});
	//sub
	
	


//PANEL 3 - YCE
	//main
$('#YCE').click(function(){
		//change text
		$('#YCEbody').slideToggle();
	});
$('#3a').click(function(){
		//change text
		$('#3abody').toggle();
	});
$('#3b').click(function(){
		//change text
		$('#3bbody').toggle();
	});
$('#3c').click(function(){
		//change text
		$('#3cbody').toggle();
	});
$('#3d').click(function(){
		//change text
		$('#3dbody').toggle();
	});
	//sub



//PANEL 4 - YD
	//main
$('#YD').click(function(){
		//change text
		$('#YDbody').slideToggle();
	});
$('#4a').click(function(){
		//change text
		$('#4abody').toggle();
	});
$('#4b').click(function(){
		//change text
		$('#4bbody').toggle();
	});
	//sub
	
	

//PANEL 5 - Oth
	//main
$('#Oth').click(function(){
		//change text
		$('#Othbody').slideToggle();
	});
$('#5a').click(function(){
		//change text
		$('#5abody').toggle();
	});
$('#5b').click(function(){
		//change text
		$('#5bbody').toggle();
	});
$('#5c').click(function(){
		//change text
		$('#5cbody').toggle();
	});
$('#5d').click(function(){
		//change text
		$('#5dbody').toggle();
	});
$('#5e').click(function(){
		//change text
		$('#5ebody').toggle();
	});
$('#5f').click(function(){
		//change text
		$('#5fbody').toggle();
	});
$('#5g').click(function(){
		//change text
		$('#5gbody').toggle();
	});
$('#5h').click(function(){
		//change text
		$('#5hbody').toggle();
	});
$('#5i').click(function(){
		//change text
		$('#5ibody').toggle();
	});
$('#suspend').click(function(){
		//change text
		$('#suspensionbody').toggle();
	});
$('#clickFood').click(function(){
		//change text
		$('#foodDesertInfo').toggle();
	});
	//sub
	
//end data

//end js	
});