//define(["jquery"],
	
	(
	
	function($){
		'use strict';

		var JQNotifications = {
			private: {
				types: ['success', 'error', 'warning', 'info'],
				autoclose: {},

				// Apply passed options to options object
					applyOptions: function(options = false, preset = false){
						var opts = {};
						if(typeof preset == 'boolean'){ preset = JQNotifications.options; }
						for(var k in preset){
							if(options.hasOwnProperty(k)){ opts[k] = options[k]; }
							else { opts[k] = preset[k]; }
						}
						return opts;
					},

				// Global Init

					// init plugin
						init: function(wrapper, options){
							var initOptions = JQNotifications.private.applyOptions(options); // apply all passed options to global options variable
							JQNotifications.public.initOptions = initOptions; // make options available publicaly once user chages are applied
							
							// Check if wrapper should be created and store notifications wrapper
							if(JQNotifications.public.initOptions.createWrappers){
								var html = JQNotifications.private.createHtml(); // generate HTML wrapper for notifications
								wrapper.append(html);
								JQNotifications.public.wrapper = wrapper.children('.' + JQNotifications.public.initOptions.prefix + 'main-wrapper:first');
							} else {
								JQNotifications.public.wrapper = wrapper;
							}

							JQNotifications.public.options = JQNotifications.options;
						},

					// Create HTML wrapper for notifications
						createHtml: function(){
							var html = '';
								html += '<div class="' + JQNotifications.public.initOptions.prefix + 'main-wrapper"></div>';
							return html;
						},



				// Single Notification Data

					// Create Single Notification HTML
						buildNotification: function(options){
							var html = '';
							html = '<div class="' + options.prefix + 'single-notification ' + options.prefix + 'type--' + JQNotifications.private.types[options.type] + '" style="display:none;">';
								if(options.dismissIcon){ // check if icon is set
									html += '<div class="' + options.prefix + 'notification-dismiss">';
										html += '<' + options.dismissButton + ' class="' + options.prefix + 'dismiss-trigger">';
											html += options.dismissIcon;
										html += '</' + options.dismissButton + '>';
									html += '</div>';
								}
								html += '<div class="' + options.prefix + 'notification-content">';

									// if title is empty string or false, do not print it
									if(options.title && options.title !== ''){
										html += '<div class="' + options.prefix + 'notification-title">';
											html += options.title;
										html += '</div>';
									}

									// if text is empty string or false, do not print it
									if(options.text && options.text !== ''){
										html += '<div class="' + options.prefix + 'notification-text">';
											html += options.text;
										html += '</div>';
									}

								html += '</div>';
							html += '</div>';
							return html;
						},

					// show notification
						showNotification: function(element, options){
							element.slideDown(options.animationTime, function(){
								JQNotifications.private.bindAutoclose(element, options);
								JQNotifications.private.bindDismiss(element, options);
								JQNotifications.private.bindContentCopy(element, options);
							});
						},

					// bind notification dismiss
						bindDismiss: function(element, options){

							// bind dismiss click on button
								element.find('.' + options.prefix + 'dismiss-trigger:first').click(function(e){
									e.preventDefault();
									JQNotifications.private.dismissNotification(element);
								});
						},

					// dismiss notification
						dismissNotification: function(element, options){
							var time = typeof options == 'object' ? options.animationTime : JQNotifications.public.initOptions.animationTime;
							var id = element.attr('data-id');
							element.slideUp(time, function(){
								$(this).remove();
							});
							if(typeof id != 'undefined'){
								clearTimeout(JQNotifications.private.autoclose[id]);
								delete JQNotifications.private.autoclose[id];
							}
						},

					// generate random ID for the element (36 character string)
						generateElementID: function(){
							function s4() {
								var s = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); 
								return s;
							}
							var s = s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
							return s;
						},

					// bind autoclose for notification
						bindAutoclose: function(element, options){
							if(options.autoclose){
								var id = JQNotifications.private.generateElementID();
								element.attr('data-id', id);
								JQNotifications.private.autoclose[id] = setTimeout(function(){
									JQNotifications.private.dismissNotification(element, options);
									clearTimeout(JQNotifications.private.autoclose[id]);
									delete JQNotifications.private.autoclose[id];
								}, options.autocloseTime);

							} else {
								if(options.debug) console.warn('Autoclose disabled');
							}
						},

					// bind click on element to copy message
						bindContentCopy: function(element, options){
							element.find('.' + options.prefix + 'notification-content:first').click(function(e){
								var text = $(this).find('.' + options.prefix + 'notification-text:first').text();
								var input = '<input name="copyText" value="' + text + '" type="text"/>';
								$(this).append(input);
								var input = $(this).children('input[name="copyText"]:first')[0];
								input.select();
								document.execCommand('copy');
								input.remove();

								JQNotifications.public.showNotification({ text: 'Message copied to clipboard', title: '', autocloseTime: 2000 });
							});
						}

			},
			public: {
				wrapper: false, // wrapper for notifications to be inserted in
				initOptions: false, // options for plugin init

				// Public Show notification -- creates totally customizable notification
					showNotification: function(options = false){
						var opts = JQNotifications.private.applyOptions(options, JQNotifications.public.initOptions); // apply new options that are passed
						var html = JQNotifications.private.buildNotification(opts); // bild notification HTML
						JQNotifications.public.wrapper.append(html); // insert notification to the page
						var notification = JQNotifications.public.wrapper.children('*').last(); // find notification selector
						JQNotifications.private.showNotification(notification, opts);
						return opts;
					},
				// Public Dismiss for Notification -- dismises selected notification
					dismissNotification: function(element = false){
						if(typeof element === 'object'){
							if(element.length > 0){
								JQNotifications.private.dismissNotification(element);
							} else {
								if(JQNotifications.options.debug) console.warn('Element does not exsts');
							}
						} else {
							if(JQNotifications.options.debug) console.warn('Element not passed');
						}
					},

				// Quick version method of Success notification
					showSuccess: function(title = false, message = false){
						var opts = { type: 0, title: title, text: message };
						JQNotifications.public.showNotification(opts);
					}, 

				// Quick version method of Error notification
					showError: function(title = false, message = false){
						var opts = { type: 1, title: title, text: message };
						JQNotifications.public.showNotification(opts);
					},

				// Quick version method of Warning notification
					showWarning: function(title = false, message = false){
						var opts = { type: 2, title: title, text: message };
						JQNotifications.public.showNotification(opts);
					},

				// Quick version method of Info notification
					showInfo: function(title = false, message = false){
						var opts = { type: 3, title: title, text: message };
						JQNotifications.public.showNotification(opts);
					}
			},
			options: {

				// global plugin options
					debug: true,  // set it to false once dev is done
					prefix: 'jqn_', // prefix for CSS code and Events
					createWrappers: true, // weather or not to create wrapper element for notifications

				// single notification options
					dismissIcon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M193.94 256L296.5 153.44l21.15-21.15c3.12-3.12 3.12-8.19 0-11.31l-22.63-22.63c-3.12-3.12-8.19-3.12-11.31 0L160 222.06 36.29 98.34c-3.12-3.12-8.19-3.12-11.31 0L2.34 120.97c-3.12 3.12-3.12 8.19 0 11.31L126.06 256 2.34 379.71c-3.12 3.12-3.12 8.19 0 11.31l22.63 22.63c3.12 3.12 8.19 3.12 11.31 0L160 289.94 262.56 392.5l21.15 21.15c3.12 3.12 8.19 3.12 11.31 0l22.63-22.63c3.12-3.12 3.12-8.19 0-11.31L193.94 256z"></path></svg>', // dismiss icon - false to disable / SVG code, IMG...
					dismissButton: 'button', // tag for dismiss icon wrapper
					autoclose: true, // weather or not to autoclose notification
					type: 0, // can be 0,1,2,3 - ['success', 'error', 'warning', 'info']
					title: 'Stop! WHAT is your name?', // title for notification
					text: 'Now go away or I will taunt you a second time.', // notification text
					animationTime: 150,  // duration for animations
					autocloseTime: 5000 // duration for auto-dismiss timer
			}
		};

		// JQuery Init Method
		$.fn.jQNotifications = function (options) {

			// Init Plugin
			JQNotifications.private.init(this, options);
			return JQNotifications.public;
		};
	}

	)(jQuery);

//);