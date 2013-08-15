/*
 * 자바스크립트 상수 선언
 * */
var isTest = 3;
//var apiKey = "80c0bbc7e9db2e1b68b301e0c90264ecdbfdeb1d";
var protocol=(location.protocol=="https:"?"https:":"http:");
var addrToCoordApiAddr = protocol+"//apis.daum.net/local/geo/addr2coord?apikey=";
var coordToAddrApiAddr = protocol+"//apis.daum.net/local/geo/coord2addr?apikey=";
var addrSearchCallback = "pongSearch";
var searchResultBody = "searchResultB";
var searchResultHeader = "searchResultH";
var roadViewAddrHeader = "rvAddr";

var _LOCAL_API_KEY = "2095508eb16d4bd426776235c7aa4424bcf9aff4";
var _DNADEV_API_KEY = "5b90a73d7eeba1b9a11135f8304d0971eddaa196";
var _DNA_API_KEY = "4f4aa74e5487db73d0fac67496c7ee3fb648d989";

var marker;		//주소 선택시 생기는 마커
var mark;		//click 시 생기는 마커
var map;
var po;
var infoWindow;

function getApiKey(){
	if(isTest == 1){
		return _LOCAL_API_KEY;
	}else if(isTest == 2){
		return _DNADEV_API_KEY;
	}else {
		return _DNA_API_KEY;
	}
}
/*
 * 주소 검색을 위한 function
 * */
function searchPosition(id){
	var query = $("#" + id).val();
	
	if(query == null || query == "" || query == "주소검색"){
		alert("검색어를 입력해 주십시오");
		return;
	}
	
	pingSearch(query);
}

/*
 * 주소 검색을 위한 api 요청
 * */
function pingSearch(query){
	var oScript = document.createElement("script");
	oScript.type = "text/javascript";
	oScript.charset = "utf-8";		  
	oScript.src = addrToCoordApiAddr + _LOCAL_API_KEY  + "&output=json&callback=" + addrSearchCallback + "&q=" + encodeURI(query);	
    document.getElementsByTagName("head")[0].appendChild(oScript);
}
/*
 * 주소 검색 callback method
 * */
function pongSearch(data){
	var resultForm = document.getElementById(searchResultBody);
	resultForm.innerHTML = "";

	if(!data.channel || data.channel.item.length <= 0){
		resultForm.innerHTML = "검색 결과가 없습니다.";
		return ;
	}else{
		var i;
		for (i = 0; i < data.channel.item.length; i++){
			resultForm.innerHTML += "<div class='addrResult'><a href='javascript:searchMark(" + 
									data.channel.item[i].lat + "," + 
									data.channel.item[i].lng +")'>" + 
									data.channel.item[i].title + "</div></div>";
		}
		document.getElementById(searchResultHeader).innerHTML = "<span class='addrResultH'>" + 
		                                                        "주소검색 -" + "<span class='redNum'> " + i + "</span>건"  + "</span>";
	}
	
}
/*
 * 검색된 주소 클릭시 오른쪽 맵에 마커 표시
 * */
function searchMark(lat,lng){
	if(mark != null)
		mark.setVisible(false);
	var po = new daum.maps.LatLng(lat, lng);
	map.setCenter(po);

	if(marker != null)
		marker.setVisible(false);
	marker = new daum.maps.Marker({
		position: po
	});
	marker.setMap(map);

	$("#latitude").val(lat);
	$("#longitude").val(lng);
}
/*
 * 검색창 클릭시 style sheet class 변경
 */
function setInputLayout(target){
	var q = document.getElementById(target);
	q.value = '';
	q.setAttribute('class','focusInput');
}


/*
 * 좌표를 통해서 주소 가져오는 function
 * */
function addAddress(lat, lng){
	var oScript = document.createElement('script');
	oScript.type ='text/javascript';
	oScript.charset ='utf-8';		  
	oScript.src = coordToAddrApiAddr + _LOCAL_API_KEY + 
				  '&latitude=' + lat + '&longitude=' + lng +
				  '&output=json&callback=addrSearch';
    document.getElementsByTagName('head')[0].appendChild(oScript);
}

/*
 * 좌표 - > 주소검색 callback
 * */
function addrSearch(data){
	$("#" + roadViewAddrHeader).text(data.fullName);
}

/*
 * 줌레벨 세팅
 * 
 */
function setZoomLevel(level){
	for(var i = 0 ; i < document.getElementById('zoomForm').length;i++){
		if(document.getElementById('zoomForm').options[i].value == level){
			document.getElementById('zoomForm').selectedIndex = i;
		}
	}
}

/*
 * 맵에 줌 적용
 * */
function changeZoomLevel(level){
	map.setLevel(level.value);
}

/* preview Popup*/
var popupStatus = 0;
function showPreView(){
	if(!beforePreviewValid())
		return ;
	loadPreviewMap();
	setPreviewSize();
	centerPopup();
	loadPopup();
}
function loadPopup(){
	if(popupStatus==0){
		$("#backgroundPopup").css({
			"opacity": "0.7"
 		});
 		$("#backgroundPopup").fadeIn("slow");
 		$("#popupContact").fadeIn("slow");
    		popupStatus = 1;
  	}
}
function centerPopup(){
	  var windowWidth = document.documentElement.clientWidth;
	  var windowHeight = document.documentElement.clientHeight;
	  var popupHeight = $("#popupContact").height();
	  var popupWidth = $("#popupContact").width();
	  $("#popupContact").css({
	    "position": "absolute",
	    "top": windowHeight / 2 - popupHeight / 2,
	    "left": windowWidth / 2 - popupWidth / 2
	  });
	  $("#backgroundPopup").css({
	  	"height": windowHeight
	  });
	}
function disablePopup(){
	if(popupStatus==1){
		$("#backgroundPopup").fadeOut("slow");
		$("#popupContact").fadeOut("slow");
		popupStatus = 0;
	}
}

function setPreviewSize(){
	var width = document.getElementById("width").value; 
	var height = document.getElementById("height").value;


	$("#popupContact").width((parseInt(width) + 10) + "px");
	$("#popupContact").height((parseInt(height) + 10) + "px");

	$("#preMap").width(width + "px");
	$("#preMap").height(height + "px");
	
	$("#previewMap").width(width + "px");
	$("#previewMap").height(height + "px");
}
function loadPreviewMap(){
	var preMap = document.mapFrm;
	preMap.target = "previewMap";
	preMap.action = "preview_map.php";
	preMap.submit();
}
function beforePreviewValid(){		//팝업띄울때 valid한 값인지 체크
	var width = $("#width").val();
	var height = $("#height").val();

	if(width > 800){
		alert("미리보기 하실 수 없는 크기 입니다.\n미리보기의 최대 크기는 가로 800px, 세로 550px 입니다.");
		$("#width").val("");
		$("#width").focus();
		return false;
	}

	if(height > 550){
		alert("미리보기 하실 수 없는 크기 입니다.\n미리보기의 최대 크기는 가로 800px, 세로 550px 입니다.");
		$("#height").val("");
		 $("#height").focus();
		return false;
	}

	if(width == "" || height == ""){
		alert("크기를 입력해 주세요.");
		return false;
	}
	
	return true;
}

function numberCheck(loc) {				//숫자만 입력받게 함.
	if(/[^0123456789]/g.test(loc.value)) {
		alert("숫자만 입력해 주세요.");
		loc.value = "";
		loc.focus();
	}
}
function changeClass(form){
	form.setAttribute('class','sizeForm');
}

function overLayContents(e){
	if(infoWindow != null){
		infoWindow.close();
		infoWindow = null;
	}
	var text = $("#contents").val().split("\n").join("<br/>");;
	infoWindow = new daum.maps.InfoWindow({
		position : po,
		content : text,				
		removable : false
	});
	infoWindow.open(map, mark);
}

function gotoNextStep(){
	var width = $("#width").val();
	var height = $("#height").val();

	if(width == "" || height == ""){
		alert("지도 크기 입력은 필수 사항입니다.");
		return;
	}
	document.mapFrm.action = "step3.php";
	document.mapFrm.target = "_self";
	document.mapFrm.submit();
}

function rvSubmit(){
	var form = document.mapFrm;
	form.target = "rv_frame";                                             

	form.action = "step2_rv.php";                             
	form.submit();   
}
function hideRoadView(width, height){
	$("#map").css({
		width: width + 'px',
		height: height + 'px'
	});

	$("#rv").css({
		"width" : 0,
		"height" : 0
	});	
	
	$("#rv_frame").css({
		"width" : 0,
		"height" : 0
	});	
	$("#rvHeader").css({
		display : 'none'
	});
	$("#rvClose").css({
		display : 'none'
	});
	
}
function showRoadView(){

	$("#map").css({
		"width" : 0,
		"height" : 0
	});

	$("#rv").css({
		width: '540px',
		height: '414px'
	});
	$("#rv_frame").css({
		width: '540px',
		height: '400px'
	});
	$("#rvHeader").css({
		display : 'block',
		width: '534px'
	});
	$("#rvClose").css({
		display : 'block'
	});
}

/*
 * 프리뷰 창의 로드뷰 숨기기
 * */
function hidePreviewRoadView(width, height){
	$("#map").css({
		"width" : width + 'px',
		"height" : height + 'px'
	});

	$("#rv").css({
		"width" : 0,
		"height" : 0
	});	
	
	$("#rv_frame").css({
		"width" : 0,
		"height" : 0
	});	
	$("#rvHeader").css({
		display : 'none'
	});
	$("#rvClose").css({
		display : 'none'
	});
	
}

/*
 * 미리보기 창에서 로드뷰 보이기
 * */
function showPreviewRoadView(width, height){

	$("#map").css({
		"width" : 0,
		"height" : 0
	});

	$("#rv").css({
		"width" : width + 'px',
		"height" : height + 'px'
	});
	$("#rv_frame").css({
		"width" : width + 'px',
		"height" : (parseInt(height) - 20) + 'px'
	});
	$("#rvHeader").css({
		display : 'block',
		width: parseInt(width) - 5 + 'px'
	});
	$("#rvClose").css({
		display : 'block'
	});
}

/*
 * 미리보기 로드뷰 iframe으로 submit
 */
function rvPreviewSubmit(width, height, latitude, longitude){
	var form = document.rvFrm;                                       
	form.target = "rv_frame";                                             

	form.action = "preview_rv.php" + 
				  "?width=" + width + 
				  "&height=" + height + 
				  "&latitude=" + latitude + 
				  "&longitude=" + longitude;                                
	form.submit();   
}


/**
 * 
 * @param option 로드뷰로 넘겨주는 파라미터 값
 * @return
 */
function rvViewSubmit(option){
	var form = document.rvFrm;                                       
	form.target = "rv_frame";                                             

	form.action = "rv_view.php" + option;                       
	form.submit();   
}

function showDaumBi(target, width){
	$("#" + target).css({
		width  : width + "px"
	});
}
function extendPanel(target, width ,height){
	$("#" + target).css({
		width: width + "px",
		height: height + "px",
		margin : "0 auto"
	});
}

function showViewRoadView(width, height){
	$("#map").css({
		"width" : 0,
		"height" : 0
	});

	$("#rv").css({
		"width" : width + 'px',
		"height" : height + 'px'
	});
	$("#rv_frame").css({
		"width" : (parseInt(width) - 4) + 'px',
		"height" : (parseInt(height) - 20) + 'px'
	});
	$("#rvHeader").css({
		display : 'block',
		width: parseInt(width) - 6 + 'px'
	});
	$("#rvClose").css({
		display : 'block'
	});
}
