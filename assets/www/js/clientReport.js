//客户端报表通用方法


    
  
    
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
    //var db=null;//数据库对象
    
    /*
    Ext.setup({
        glossOnIcon: false,
        onReady: function() {
    */
        	//db = window.openDatabase("xburnerdb", "1.0", "xburnerdb", 200000);//初始化数据库
        	//var  reportid=(GetArgsFromHref(window.location.href ,"reportid"));//报表ID
    function openChart(reportid){
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
        	
  /*      	
        }
    });
        	*/
    var onHelpTap=null;//帮助按钮
    
    
    var chartPanel=null;//图表窗口
    //展现报表
    function renderReport(_reportObject){
    	if(chartPanel){
    		tabs.remove(chartPanel);//删除原来展现的图表
    		chartPanel=null;
    	}
    	//柱图
    	if(_reportObject.define.charttype=='column'){
    		
    		
    		
    		onHelpTap = function() {//帮助信息
    	        new Ext.Panel({
    	            floating: true,
    	            modal: true,
    	            centered: true,
    	            width: 300,
    	            height: 250,
    	            styleHtmlContent: true,
    	            scroll: 'vertical',
    	            dockedItems: [{
    	                dock: 'top',
    	                xtype: 'toolbar',
    	                title: '柱图'
    	            }],
    	            stopMaskTapEvent: false,
    	            fullscreen: false,
    	            html: "柱图实例,数据来自GIP"
    	        }).show('pop');
    	    };
    	    chartPanel =new Ext.chart.Panel({
                title: _reportObject.queryname,//图表标题
                iconCls: 'info',
                dockedItems: [
                      {//帮助
                       xtype: 'button',
                       iconCls: 'help',
                       iconMask: true,
                       ui: 'plain',
                       handler: onHelpTap
                      }          
                ],
                items: [{
                    cls: 'column1',
                    store: store,
                    animate: {
                        easing: 'bounceOut',//滑动
                        duration: 750
                    },
                    shadow: false,
                    legend: {
                        position: {
                            portrait: 'right',
                            landscape: 'top'
                        },
                        labelFont: '17px'
                    },
                    axes: [{
                        type: 'Numeric',
                        position: 'left',
                        fields: reportObject.define.y.split(","),
                        title: '指标', 
                        grid: true, 
                        minimum: 0
                    }, {//坐标轴
                        type: 'Category',
                        position: 'bottom',
                        fields: [_reportObject.define.x],
                        title: colMap[_reportObject.define.x]
                    }],
                    series: [  
                         {
                          type: 'column',
                          highlight: true,
                          axis: 'left',
                          smooth: true,
                          xField:[_reportObject.define.x],//X轴
                          yField: _reportObject.define.y.split(","),
                          label: {//显示数据
                        	    display: 'outside',//在柱子外面显示
                        	    'text-anchor': 'middle',
                        	    isOutside:true,
                        	    field: _reportObject.define.y.split(","),
                        	    orientation: 'horizontal',//水平显示
                        	    color: '#333'//字体颜色
                          },
                        //图例标题
                          title:getYLabel( _reportObject.define.y.split(","))
                          
                         }   
                      
                      
                    ],
                    interactions: [{
                        type: 'reset'
                    },
                    {
                        type: 'togglestacked'
                    },
                    {
                        type: 'panzoom',//放大缩小
                        axes: {
                            left: {}
                        }
                    },
                    {
                        type: 'itemcompare',
                        offset: {
                            x: -10
                        },
                        listeners: {
                            'show': function(interaction) {//增长对比显示
                                var val1 = interaction.item1.value,
                                    val2 = interaction.item2.value;

                                var n=Math.round((val2[1] - val1[1]) / val1[1] * 100);
                                var text="增长";
                                if(n<0){
                                    text="减少";
                                }
                                
                                chartPanel.descriptionPanel.setTitle(val1[0] + ' 到 ' + val2[0] + ' '+text+' ' + n + '%');
                                chartPanel.headerPanel.setActiveItem(1, {
                                    type: 'slide',
                                    direction: 'left'
                                });
                            },
                            'hide': function() {//隐藏
                                chartPanel.headerPanel.setActiveItem(0, {
                                    type: 'slide',
                                    direction: 'right'
                                });
                            }
                        }
                    }]
                }]
    	    });
    	    
    	    tabs.add(chartPanel);//在tab上添加
    	    tabs.setActiveItem(chartPanel);//设为当前tab
    	}
    	else
    	//线图	
    	if(_reportObject.define.charttype=='line'){
    		
    		onHelpTap = function() {//帮助信息
    	        new Ext.Panel({
    	            floating: true,
    	            modal: true,
    	            centered: true,
    	            width: 300,
    	            height: 250,
    	            styleHtmlContent: true,
    	            scroll: 'vertical',
    	            dockedItems: [{
    	                dock: 'top',
    	                xtype: 'toolbar',
    	                title: '线图'
    	            }],
    	            stopMaskTapEvent: false,
    	            fullscreen: false,
    	            html: "线图实例,数据来自GIP"
    	        }).show('pop');
    	    };
    	    var series=[];//列模型
        	
        	
        	for(var j=0,l=_reportObject.define.y.split(",").length;j<l;j++){
        		
        		var ys=_reportObject.define.y.split(",")[j];
        		
        		
        		series.push({
                    type: 'line',
                    showMarkers: false,
                    highlight: {
                        size: 7,
                        radius: 7
                    },
                    axis: 'left',
                    smooth: true,
                    xField: _reportObject.define.x,
                    yField: ys,
                    title:colMap[ys]
                });
        	}
        	
        	
        	
        	
        	chartPanel =new Ext.chart.Panel({
                title: _reportObject.queryname,//图表标题
                iconCls: 'info',
                dockedItems: [
                      {//帮助
                       xtype: 'button',
                       iconCls: 'help',
                       iconMask: true,
                       ui: 'plain',
                       handler: onHelpTap
                      }          
                ],
                items: [{
                    cls: 'line1',
                    theme: 'Demo',
                    store: store,
                    animate: true,
                    shadow: true,
                    legend: {
                        position: 'right'
                    },
                    interactions: [
                       {
                          type: 'panzoom',
                          axes: {//各个方向的放大倍数
                        	  left: {
                                  maxZoom: 2
                              },
                              bottom: {
                                  maxZoom: 4
                              },
                              right: {
                                  minZoom: 0.5,
                                  maxZoom: 4,
                                  allowPan: false
                              }
                          }
                       }, 
                       {
                          type: 'iteminfo',
                          panel:{
                        	  
                        	  dockedItems: [{
                                  dock: 'top',
                                  xtype: 'toolbar',
                                  title: '明细数据'
                              }]
                          },
                          listeners: {
                             show: function(interaction, item, panel) {
                               var yField=interaction.item.series.yField;
                               var storeItem = item.storeItem;
                               
                               
                               panel.update(['<ul><li><b>'+colMap[_reportObject.define.x]+': </b>' + storeItem.get(_reportObject.define.x) + '</li>', '<li><b>'+colMap[yField]+': </b> ' + item.value[1]+ '</li></ul>'].join(''));
                               
                               
                             }
                       }
                   }],
                    axes: [{
                        type: 'Numeric',
                        position: 'left',
                        fields: _reportObject.define.y.split(","),
                        title: '指标',
                        minorTickSteps: 1
                    }, {
                        type: 'Category',
                        position: 'bottom',
                        fields: [_reportObject.define.x],
                        title: colMap[_reportObject.define.x]
                    }],
                    series: series
                }]
    	    });
        	tabs.add(chartPanel);//在tab上添加
     	    tabs.setActiveItem(chartPanel);//设为当前tab
    	}
    	else
    	//饼图	
    	if(_reportObject.define.charttype=='pie'){
    		onHelpTap = function() {//帮助信息
    	        new Ext.Panel({
    	            floating: true,
    	            modal: true,
    	            centered: true,
    	            width: 300,
    	            height: 250,
    	            styleHtmlContent: true,
    	            scroll: 'vertical',
    	            dockedItems: [{
    	                dock: 'top',
    	                xtype: 'toolbar',
    	                title: '饼图'
    	            }],
    	            stopMaskTapEvent: false,
    	            fullscreen: false,
    	            html: "饼图实例,数据来自GIP"
    	        }).show('pop');
    	    };
    	    chartPanel =new Ext.chart.Panel({
	            title: _reportObject.queryname,//图表标题
	            iconCls: 'info',
	            dockedItems: [
                      {//帮助
                       xtype: 'button',
                       iconCls: 'help',
                       iconMask: true,
                       ui: 'plain',
                       handler: onHelpTap
                      }          
	            ],
	            items: [{
	                cls: 'pie1',
	                theme: 'Demo',
	                store: window.store,
	                shadow: false,
	                animate: true,
	                insetPadding: 20,
	                legend: {
	                    position: {
	                        portrait: 'bottom',
	                        landscape: 'left'
	                    }
	                },
	                interactions: [{
	                    type: 'reset',
	                    confirm: true
	                },
	                {
	                    type: 'rotate'
	                },
	                {
	                    type: 'piegrouping',
	                    //snapWhileDragging: true,
	                    onSelectionChange: function(me, items) {
	                    	
	                    	
	                    	var showTotal=0;//已显示标签的总数
	                    	var lg=me.getSeries().labelsGroup.items;//标签组
	                    	for(var i=0,s=lg.length;i<s;i++){//计算总数(显示的)
	                    		
	                    		if(!lg[i].attr.hidden){

		                            debugger;
	                    			showTotal+=storeDataMap[lg[i].attr.text];
	                    		}
	                    	}
	                    	
	                    	
	                        if (items && items.length) {
	                            var sum = 0,
	                                i = items.length;
	                            while(i--) {
	                                sum += items[i].storeItem.get(_reportObject.define.y);
	                            }
	                            var title=colMap[_reportObject.define.y]+': ' + sum+"("+(sum*100/showTotal).toFixed(2)+"%)";
	                            chartPanel.descriptionPanel.setTitle(title);//显示百分比
	                            chartPanel.headerPanel.setActiveItem(1, {
	                                type: 'slide',
	                                direction: 'left'
	                            });
	                        }
	                        else {
	                            chartPanel.headerPanel.setActiveItem(1, {
	                                type: 'slide',
	                                direction: 'left'
	                            });
	                            chartPanel.descriptionPanel.setTitle(colMap[reportObject.define.y]+"总数:"+showTotal+"(100%)");//显示总数
	                        }
	                    }
	                }],
	                series: [{
	                    type: 'pie',
	                    field: _reportObject.define.y,
	                    showInLegend: true,
	                    highlight: false,
	                    listeners: {
	                        'labelOverflow': function(label, item) {
	                            item.useCallout = true;
	                        }
	                    },
	                    // Example to return as soon as styling arrives for callouts
	                    callouts: {
	                        renderer: function(callout, storeItem) {
	                            callout.label.setAttributes({
	                                text: storeItem.get(_reportObject.define.x)
	                            }, true);
	                        },
	                        filter: function() {
	                            return false;
	                        },
	                        box: {
	                          //no config here.
	                        },
	                        lines: {
	                            'stroke-width': 2,
	                            offsetFromViz: 20
	                        },
	                        label: {
	                           font: 'italic 14px Arial'
	                        },
	                        styles: {
	                            font: '14px Arial'
	                        }
	                    },
	                    label: {
	                        field:_reportObject.define.x
	                    }
	                }]
	             }]   
    	 });
    	    
    	    tabs.add(chartPanel);//在tab上添加
     	    tabs.setActiveItem(chartPanel);//设为当前tab
    	}
    	  
    }