
var db=null;

//初始化数据库
function initdb(){
  try{	
	 db = window.openDatabase("xburnerdb", "1.0", "xburnerdb", 200000);
	 
	 
	 
	 //初始化配置表
	 db.transaction(
			 
	      function(tx){
	    	  tx.executeSql('CREATE TABLE IF NOT EXISTS T_SETTING (id  unique,  value )');
	      },
	      //失败
	      function(err){
	    	  alert("初始化数据库失败:"+err.code);
	      },
	      //成功
	      function(tx, results){
	    	  
	    	  
	    	  
	    	  getSetting("baseURL",function(tx ,results){
	    		  
	    		  if(!results || !results.rows ||results.rows.length==0){}
	    		  else{
	    			  Ext.getCmp("baseURL").setValue(results.rows.item(0).value);//设置服务地址
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
		    	  tx.executeSql("select * from  T_SETTING where id='"+_id+"' "  ,
		    		  [] ,
				      //成功
				      function(tx, results){
				    	  
				    	  if(!results || !results.rows ||results.rows.length==0){
				    		  
				    		  db.transaction(
				    		     function(tx){
				    		    	 
				    		    	 tx.executeSql("insert into T_SETTING values('"+_id+"','"+_value+"')  ");
				    		     },
				   		          //失败
				   		         function(err){
				   		    	     alert("插入设置表失败:"+err.code);
				   		         },
				   		          //成功
				   		         function(tx, results){
				   		    	     alert("插入设置表成功");
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
						   		    	     alert("更新设置表失败:"+err.code);
						   		         },
						   		          //成功
						   		         function(tx, results){
						   		    	     alert("更新设置表成功");
						   		         }
						    		     
						    		  
						      );
				    	  }
				    	  
				      },
				      //失败
				      function(err){
				    	  alert("查询设置表失败:"+err.code);
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
		    	  tx.executeSql("select * from  T_SETTING where id='"+_id+"' "  ,
		    		  [] ,
				      callback,
				      //失败
				      function(err){
				    	  alert("查询设置表失败:"+err.code);
				      }
		    	  );
		      }
	);	      
	
}