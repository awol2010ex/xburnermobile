//客户端报表通用方法


/* 
  　　*函数功能:从href获得参数 
  　　*sHref: http://www.yesky.com/arg.htm?arg1=d&arg2=re 
  　　*sArgName:arg1, arg2 
  　　*return: the value of arg. d, re 
  　　*/ 
  　　function GetArgsFromHref(sHref, sArgName) 
  　　{ 
  　　  var args = sHref.split("?"); 
  　　  var retval = ""; 
  　　  if(args[0] == sHref) /*参数为空*/ 
  　　  { 
  　　     return retval; /*无需做任何处理*/ 
  　  　} 
  　　  var str = args[1]; 
  　　  args = str.split("&"); 
  　　  for(var i = 0; i < args.length; i ++) 
  　　  { 
  　　    str = args[i]; 
  　　    var arg = str.split("="); 
  　　    if(arg.length <= 1) continue; 
  　　    if(arg[0] == sArgName) retval = arg[1]; 
  　　  } 
  　　  return retval; 
  　　}
    
    
    
  //根据报表ID取得当前报表定义
    function getDefineByReportid(reportid){
    
        return null;
    }
    
    
    
    
    
    function formatData(rows,x,y)//饼图修整数据
	{
		
		var sum=0;
		var _rows=[];
		for(var i=0,s=rows.length;i<s;i++){
        	   rows[i][y]=Number(rows[i][y]);//字符串转数值
        	   
        	   sum+=rows[i][y];//累加
        	   
        	   
        	   storeDataMap[ rows[i][x]]=rows[i][y];//缓存数据
        }
		
		
		for(var i=0,s=rows.length;i<s;i++){
        	
			   if(rows[i][y]/sum<0.001){//比率太小导致颜色显示错误
				   
			   }else{
				   _rows.push(rows[i]);
			   }
        }
		
		return _rows;
		
	}
    
    //取得Y轴标签
    function getYLabel(ys){
    	var labels=[];
    	for(var i=0,s=ys.length ;i<s ;i++)
    	{
    		
    		labels.push(colMap[ys[i]]);
    	}
    	
    	return labels;
    }
    
    var colMap={};//字段别名映射
    var fields=[];//字段列表
    
    var storeDataMap={};//饼图数据Map
    var reportObject=null;//报表内容
    var db=null;//数据库对象
    Ext.setup({
        glossOnIcon: false,
        onReady: function() {
        	db = window.openDatabase("xburnerdb", "1.0", "xburnerdb", 200000);//初始化数据库
        	var  reportid=(GetArgsFromHref(window.location.href ,"reportid"));//报表ID
        	//取得报表
        	getClientReportById(reportid ,function(tx,results){
        		
        		var item=results.rows.item(0);//查询得到报表数据
        		
        		reportObject={id : item.id  ,queryname :item.queryname , define:Ext.decode(item.define)};
        		
        		
        		//字段模型
        		var cols=reportObject.define.cols;
            	
            	for(var i=0,s=cols.length;i<s;i++){
            		fields.push(cols[i].label);//字段
            		if(cols[i].alias){
            		  colMap[cols[i].label]=cols[i].alias;//字段别名
            		}else{
            	      colMap[cols[i].label]=cols[i].label;//字段名
            		}
            	}
            	
            	//数据源
            	window.store= new Ext.data.JsonStore({
    	            fields: fields,
    	            data: (  (reportObject.define.charttype=='pie' ?   formatData(reportObject.define.data,reportObject.define.x, reportObject.define.y) : reportObject.define.data)  )
    	        });
            	
            	
            	
            	//展现报表
                renderReport(reportObject);
        		
        	});
        	
        	
        	
        }
    });