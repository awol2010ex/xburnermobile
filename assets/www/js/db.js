
var db=null;

//初始化数据库
function initdb(){
  try{	
	 db = window.openDatabase("xburnerdb", "1.0", "xburnerdb", 200000);
	 
	 
	 
	 //初始化配置表
	 db.transaction(
			 
	      function(tx){
	    	  tx.executeSql('CREATE TABLE IF NOT EXISTS T_SETTING (id  unique,  value )');//生成设置表
	    	  
	    	  tx.executeSql('CREATE TABLE IF NOT EXISTS T_BIZ_QUERY (id  unique,  queryname  ,define ,foldername )');//生成报表信息表
	      },
	      //失败
	      function(err){
	    	  //alert("初始化数据库失败:"+err.code);
	    	  
	    	  Ext.Msg.alert('错误', "初始化数据库失败:"+err.code, Ext.emptyFn);
	      },
	      //成功
	      function(tx, results){
	    	  
	    	  
	    	  //取得服务端地址
	    	  getSetting("baseURL",function(tx ,results){
	    		  
	    		  if(!results || !results.rows ||results.rows.length==0){
	    			  
	    			  initView();//初始化页面
	    		  }
	    		  else{
	    			  
	    			  var _baseURL=results.rows.item(0).value;//服务端地址
	    			  
	    			//服务端列表展现模板
	    			  itemTplServer= '<div class="contact"  style="padding:10px">'+
	    			                                          '<img src="icon/download.jpg" height="36" width="36"   onclick="downloadChart(\'{id}\')"/>&nbsp;&nbsp;'+ //下载按钮
	    			                                          '<a  target="_blank" href="'+
	    			                                          _baseURL
	    			                                          +'/restful/report/chart/open/?reportid={id}"><img src="icon/charticon/{define.charttype}/icon-ipad.png"  height="36" width="36"/></a>'+   //打开报表按钮
	    			                                          '&nbsp;&nbsp;<strong>{foldername}</strong> /<strong>{queryname}</strong>&nbsp;&nbsp;&nbsp;'+
	    			                                          '<div id="loadingimg_{id}"></div>'+
	    			                                          '</div>';
	    			  initView();//初始化页面
	    			  
	    			  Ext.getCmp("baseURL").setValue(_baseURL);//设置服务地址
	    			  
	    			  
	    			//刷新服务端列表
	    			  refreshServerList();
	    			//刷新客户端报表
	    			  refreshClientReport();
	    		  }
	    		  
	    	  })
	      }
	 );
  }catch(e){
	 console.log(e); 
  }
	
}

//更新设置
function updateSetting(_id ,_value){
	try{	
		 
		 //初始化配置表
		 db.transaction(
				 
		      function(tx){
		    	  tx.executeSql("select * from  T_SETTING where id=?"  ,
		    		  [_id] ,
				      //成功
				      function(tx, results){
				    	  
				    	  if(!results || !results.rows ||results.rows.length==0){
				    		  
				    		  db.transaction(
				    		     function(tx){
				    		    	 
				    		    	 tx.executeSql("insert into T_SETTING values('"+_id+"','"+_value+"')  ");
				    		     },
				   		          //失败
				   		         function(err){
				   		    	     //alert("插入设置表失败:"+err.code);
				   		    	     
				   		    	     Ext.Msg.alert('错误', "插入设置表失败:"+err.code, Ext.emptyFn);
				   		         },
				   		          //成功
				   		         function(tx, results){
				   		    	     //alert("插入设置表成功");
				   		    	     
				   		    	     Ext.Msg.alert('提示',"插入设置表成功", Ext.emptyFn);
				   		         }
				    		     
				    		  
				    		  );
				    	  }
				    	  else{
				    		  
				    		  db.transaction(
						    		     function(tx){
						    		    	 
						    		    	 tx.executeSql("update T_SETTING set value='"+_value+"'   where  id='"+_id+"'  ");
						    		     },
						   		          //失败
						   		         function(err){
						   		    	     //alert("更新设置表失败:"+err.code);
						   		    	     Ext.Msg.alert('错误',"更新设置表失败:"+err.code, Ext.emptyFn);
						   		         },
						   		          //成功
						   		         function(tx, results){
						   		    	     //alert("更新设置表成功");
						   		    	     Ext.Msg.alert('提示',"更新设置表成功", Ext.emptyFn);
						   		         }
						    		     
						    		  
						      );
				    	  }
				    	  
				      },
				      //失败
				      function(err){
				    	  //alert("查询设置表失败:"+err.code);
				    	  Ext.Msg.alert('错误',"查询设置表失败:"+err.code, Ext.emptyFn);
				      }
		    			        
		    			        
		    	  
		    	  
		    	  );
		      }
		 );
	  }catch(e){
		 console.log(e); 
	  }
}



//取得设置值
function getSetting(_id , callback){
	 db.transaction(
			 
		      function(tx){
		    	  tx.executeSql("select * from  T_SETTING where id=? "  ,
		    		  [_id] ,
				      callback,
				      //失败
				      function(err){
				    	  //alert("查询设置表失败:"+err.code);
				    	  
				    	  Ext.Msg.alert('错误',"查询设置表失败:"+err.code, Ext.emptyFn);
				      }
		    	  );
		      }
	);	      
	
}

//保存报表
function saveQuery(_id , _queryname , _define ,_foldername){
	
	try{	
		 
		 //保存报表信息表
		 db.transaction(
				 
		      function(tx){
		    	  tx.executeSql("select * from  T_BIZ_QUERY where id=?"  ,
		    		  [_id] ,
				      //成功
				      function(tx, results){
				    	  //没有就插入
				    	  if(!results || !results.rows ||results.rows.length==0){
				    		  
				    		  db.transaction(
				    		     function(tx){
				    		    	 
				    		    	 tx.executeSql("insert into T_BIZ_QUERY values(?,?,?,?)  ",[_id , _queryname , _define ,_foldername]);
				    		     },
				   		          //失败
				   		         function(err){
				   		    	     //alert("插入报表信息表失败:"+err.code);
				   		    	     Ext.Msg.alert('错误',"插入报表信息表失败:"+err.code, Ext.emptyFn);
				   		    	     
				   		         },
				   		          //成功
				   		         function(tx, results){
				   		    	     //alert("插入报表信息表成功");
				   		    	     
				   		    	     Ext.Msg.alert('提示',"插入报表信息表成功", Ext.emptyFn);
				   		    	     

				        	            //刷新客户端报表
				  	    			    refreshClientReport();
				   		         }
				    		     
				    		  
				    		  );
				    	  }
				    	  else{
				    		  //有就更新
				    		  db.transaction(
						    		     function(tx){
						    		    	 
						    		    	 tx.executeSql("update T_BIZ_QUERY set queryname=?, define=?, foldername=?   where  id=? ",[_queryname , _define ,_foldername,_id ]);
						    		     },
						   		          //失败
						   		         function(err){
						   		    	     //alert("更新报表信息表失败:"+err.code);
						   		    	     
						   		    	     Ext.Msg.alert('错误',"更新报表信息表失败:"+err.code, Ext.emptyFn);
						   		         },
						   		          //成功
						   		         function(tx, results){
						   		    	     //alert("更新报表信息表成功");
						   		    	     
						   		    	     Ext.Msg.alert('提示',"更新报表信息表成功", Ext.emptyFn);
						   		         }
						    		     
						    		  
						      );
				    	  }
				    	  
				      },
				      //失败
				      function(err){
				    	  //alert("查询报表信息表失败:"+err.code);
				    	  
				    	  Ext.Msg.alert('错误',"查询报表信息表失败:"+err.code, Ext.emptyFn);
				      }
		    			        
		    			        
		    	  
		    	  
		    	  );
		      }
		 );
	  }catch(e){
		 console.log(e); 
	  }
}

//取得客户端已保存报表
function getClientReportList(callback){
  db.transaction(
	function(tx){	
	 tx.executeSql("select * from  T_BIZ_QUERY",[],
	  //成功
			 callback,
	  //失败
      function(err){
   	 
   	  
   	   Ext.Msg.alert('错误',"查询报表信息表失败:"+err.code, Ext.emptyFn);
      }
	 );
	}
  );
}


//删除客户端已保存报表
function removeClientReportList(_id,callback){
	  db.transaction(
		function(tx){	
		 tx.executeSql("delete from   T_BIZ_QUERY  where id= ?",[_id],
		  //成功
		  callback,
		  //失败
	      function(err){
	   	 
	   	  
	   	   Ext.Msg.alert('错误',"删除报表信息表失败:"+err.code, Ext.emptyFn);
	      }
		 );
		}
	  );
}

//取得某一个已下载的报表
function getClientReportById(_id ,callback){
	 db.transaction(
				function(tx){	
				 tx.executeSql("select *  from   T_BIZ_QUERY  where id= ?",[_id],
				  //成功
				  callback,
				  //失败
			      function(err){
			   	 
			   	  
			   	   Ext.Msg.alert('错误',"删除报表信息表失败:"+err.code, Ext.emptyFn);
			      }
				 );
				}
			  );
	
}



