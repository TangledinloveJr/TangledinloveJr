if (!window["App"]) throw new Error("Critical Error in Application");
(function m(App) {


    //===========================================================================================================


    function lib() {
        var _windowContainer = null,
        _guid = null,
        _poll = this,
        _name = '',
        _store = null;

        var header, panel;

        var save = function(){ //Функция сохранения изменений в анкете
            if (!panel.container['form'].pharmId) return false;

            var modifyData = '';

            $.each(_store.getModifiedRecords(), function(index, rec){
                $.each(rec.modified, function(name){
                    modifyData += '&values['+index+']['+name+']=' + rec.data[name];
                });
                modifyData += '&id['+index+']=' + rec.id;
            });
            if (modifyData == '') return;
                $.getJSON('./modules/units/units.php?action=SET_FORMDATA&pharmId='+panel.container['form'].pharmId+'&projectId='+_param.projectId+'&stageId='+_param.stageId + modifyData +'&rnd='+Math.random(), function(data){
                if (!data || !data.result){
                    alert('ошибка сохранения, попробуйте еще раз');
                    //_store.rejectChanges();
                }else if (data.result == true){
                    _store.commitChanges();
                    panel.container['form'].loadData(panel.container['form'].pharmId);
                }
                $.unblockUI();
            }.bind(this));
        }

        var Header = function (container) {
            var id = 'li[rel = "' + _guid + '"] '+ ".context";
            var template = '<div class="header" style="clear:both; font-size: small;"><div class="context" style="clear:both; overflow:hidden"></div><div class="header_button collapse"></div><div class="buttons">&nbsp;</div></div>';
            Header.superClass.apply(this, [id, template, container]);

            this.appendTo = function (parent) {
                $(parent).append(this.template);
                return this;
            }

            var _expanded = true;

            this.expand = function(callback){
                _expanded = true;
                _windowContainer.find('.header_button').removeClass('expand').addClass('collapse');
                this.element().animate({
                    height: this.container['title'].element().outerHeight() + this.container['description'].element().outerHeight()
                }, "fast", callback);
            }

            this.height = function (height) {
                return _windowContainer.find('.header').outerHeight()
            }

            this.expanded = function(){
                return _expanded;
            }

            this.addButton = function(caption, delegate){
                _windowContainer.find('.buttons').append('<input type="button" id="'+caption+'" value="'+caption+'" />');
                _windowContainer.find('.buttons #'+caption).click(delegate);
            }

            this.collapse = function(callback){
                _expanded = false;
                _windowContainer.find('.header_button').removeClass('collapse').addClass('expand');
                this.element().animate({
                    height: this.container['title'].element().outerHeight()
                }, "fast", callback);
            }

            this.toggle = function(callback){
                if (_expanded){
                    this.collapse(callback);
                }else{
                    this.expand(callback);
                }
            }

            this.click = function(delegate){
                if (!delegate){
                    _windowContainer.find('.header_button').click();
                }else{
                    _windowContainer.find('.header_button').unbind().click(delegate);
                }
            }
        }
        Header.inherits(App.VisualElement);//Наследуем элемент от базового из файла part_of_core.js

        var Title = function(){
            var id = 'li[rel = "' + _guid + '"] '+ ".title";
            var template = '<div class="title" style="clear:both">Приближая весну</div>';
            Title.superClass.apply(this, [id, template]);
        }
        Title.inherits(App.VisualElement);
        
        var Description = function(){
            var id = 'li[rel = "' + _guid + '"] '+ ".description";
            var template = '<div class="description" style="clear:both"></div>';
            Description.superClass.apply(this, [id, template]);
        }
        Description.inherits(App.VisualElement);
                
        var Panel = function(container){
            var id = 'li[rel = "' + _guid + '"] '+ ".panel";
            var template = '<div class="panel" style="width: 100%;"></div>';
            Panel.superClass.apply(this, [id, template, container]);
        }
        Panel.inherits(App.VisualElement);

        var Grid = function () { 
            var id = 'li[rel = "' + _guid + '"] '+ ".grid";
            var template = '<div class="grid" style="background-color: #98fb98; float: left; width: 250px;"></div>';
            Grid.superClass.apply(this, [id, template]);

            var store = new Ext.data.JsonStore({// аналог "DataTable" из состава ExtJS
                root: 'units',
                totalProperty: 'count',
                idProperty: 'id',
                remoteSort: false,

                fields: [
                    'id', 'name', 'address', 'town', {name: 'checked', type: 'bool'}
                ],

                url: 'modules/units/units.php?action=GET_ACTIVE_PHARMACIES&projectId='+_param.projectId+'&stageId='+_param.stageId+'&rnd='+Math.random()
            });
            store.setDefaultSort('id', 'desc');

            function renderTopic(value, p, record) {
                return String.format('{1}, {2} {3}', record.data.town, value, record.data.address);
            }

            var grid = new Ext.grid.GridPanel({//многофункциональный грид из состава ExtJS
                store: store,
                trackMouseOver: false,
                disableSelection: false,
                width: 250,
                loadMask: new Ext.LoadMask(Ext.getBody(), {onLoad: function(){ $.unblockUI(); } , onBeforeLoad: function(){ $.blockUI(); } }),

                columns: [
                {
                    header: "Аптека",
                    dataIndex: 'name',
                    width: 200,
                    renderer: renderTopic,
                    sortable: true
                }],

                viewConfig: {
                    forceFit: true,
                    enableRowBody: true,
                    showPreview: true
                }
            });

            this.rowClick = function(event){
                grid.on('rowclick', function(grid, rowIndex, e) {
                    var r = grid.getStore().getAt(rowIndex);
                    event(r, rowIndex);
	            });
            }            
