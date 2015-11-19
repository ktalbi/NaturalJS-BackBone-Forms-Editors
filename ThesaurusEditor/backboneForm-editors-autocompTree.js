define([
	'underscore',
	'jquery',
    'jqueryui',
	'backbone',
	'backbone_forms',
	'autocompTree',
], function (
	_, $, $ui, Backbone, Form, autocompTree
) {


    Backbone.Form.validators.Thesaurus = function (options) {
        return function Thesaurus(value) {
            if (value == '') return ;
            //console.log('***************************************validateurThesaurus',options,value);

            var TypeField = "FullPath";
                if (value && value.indexOf(">") == -1) {
                    TypeField = 'Name';
                }
            var retour ;

            $.ajax({
                url: options.wsUrl + "/ThesaurusReadServices.svc/json/getTRaductionByType",
                timeout: 3000,
                data: '{ "sInfo" : "' + value + '", "sTypeField" : "' + TypeField + '", "iParentId":"' + options.startId + '" }',
                dataType: "json",
                type: "POST",
                async:false,
                contentType: "application/json; charset=utf-8",
                success: function (data) {
                    retour = null;
                },
                error: function (data) {
                    //console.log('***************************erreur de validation*******************')
                    retour = {
                            type: options.type,
                            message: 'Not-Valid Value'
                            }; 
                    
                }
            });
            /*
            $.when(defered).done(function() {
                                  
            });*/
            return retour ;
        };
    };

    'use strict';
    return Form.editors.AutocompTreeEditor = Form.editors.Base.extend({


        previousValue: '',

        events: {
            'hide': "hasChanged"
        },

        hasChanged: function (currentValue) {
            if (currentValue !== this.previousValue) {
                this.previousValue = currentValue;
                this.trigger('change', this);
            }
        },

        initialize: function (options) {
            this.languages = {
                'fr':'',
                'en':'En'
            };
            this.validators = options.schema.validators || [] ;
            
            Form.editors.Base.prototype.initialize.call(this, options);
            this.template = options.template || this.constructor.template;
            this.id = options.id;
            var editorAttrs = "";
            if (options.schema.editorAttrs && options.schema.editorAttrs.disabled) {
                editorAttrs += 'disabled="disabled"';
            }
            var tplValeurs = {
                inputID: this.id,
                editorAttrs: editorAttrs,
                editorClass: options.schema.editorClass
            }
            this.template = _.template(this.template, tplValeurs);
            this.startId = options.schema.options.startId;
            this.wsUrl = options.schema.options.wsUrl;
            this.lng = options.schema.options.lng;
            this.displayValueName = options.schema.options.displayValueName || 'fullpathTranslated';
            this.storedValueName = options.schema.options.storedValueName || 'fullpath';
            this.validators.push({ type: 'Thesaurus', startId: this.startId, wsUrl:this.wsUrl  });
        },

        getValue: function () {
            var date = new Date
            return this.$el.find('#' + this.id + '_value').val();
        },

        render: function () {

            var $el = $(this.template);
            this.setElement($el);
            var _this = this;
            _(function () {
                _this.$el.find('#' + _this.id).autocompTree({
                    wsUrl: _this.wsUrl + '/ThesaurusREADServices.svc/json',
                    webservices: 'fastInitForCompleteTree',
                    language: { hasLanguage: true, lng: _this.lng },
                    display: {
                        isDisplayDifferent: true,
                        suffixeId: '_value',
                        displayValueName: _this.displayValueName,
                        storedValueName: _this.storedValueName
                    },
                    inputValue: _this.value,
                    startId: _this.startId
                });
                var TypeField = "FullPath";
                if (_this.value && _this.value.indexOf(">") == -1) {
                    TypeField = 'Name';
                }
                var valeur = _this.value || '';
                $.ajax({
                    url: _this.wsUrl + "/ThesaurusReadServices.svc/json/getTRaductionByType",
                    timeout: 10000,
                    data: '{ "sInfo" : "' + valeur + '", "sTypeField" : "' + TypeField + '", "iParentId":"' + _this.startId + '" }',
                    dataType: "json",
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    success: function (data) {
                        var translatedValue = data["TTop_FullPath" + _this.languages[_this.lng.toLowerCase()]];
                        if (_this.displayValueName  == 'valueTranslated') {
                            translatedValue = data["TTop_Name" + _this.languages[_this.lng.toLowerCase()]];
                        }
                        _this.$el.find('#' + _this.id).val(translatedValue);
                        _this.$el.find('#' + _this.id + '_value').val(data["TTop_FullPath"]);
                    },
                    error: function (data) {
                        //_this.$el.find('#' + _this.id).val('_this.value');
                        _this.$el.find('#' + _this.id + '_value').val(_this.value);
                        //$('#' + _this.id + '_value').val(this.value);
                    }
                });
            }).defer();

            return this;
        },

    }, {
        template: '<div><input id="<%=inputID%>" name="<%=inputID%>" class="autocompTree <%=editorClass%>" type="text" placeholder="" <%=editorAttrs%>></div>',
    });


});
