/*!
	Matt Tabs v2.1
	A simple jQuery plugin for creating tabbed interfaces.
	
	https://github.com/matthewhall/matt-tabs
*/

;(function($, window, document) {
	"use strict";
	
	var MattTabs = function(element, options) {
		var self = this;
		
		self.element = element;
		self.$element = $(element);
		self.tabs = self.$element.children();
		self.options = $.extend({}, $.fn.mtabs.defaults, options);
		
		self.init();
	};
	
	MattTabs.prototype = {
		init: function() {
			var self = this;
			
			if (self.tabs.length) {
				// Build.
				self.build();
				self.buildTabMenu();
			}
		},
		
		build: function() {
			var self = this,
				opts = self.options,
				tab_text_el = opts.tab_text_el,
				container_class = opts.container_class;
			
			// Array to collect tab names.
			self.tab_names = [];
			
			// Wrap everything in a container element.
			self.$wrapper = self.$element.wrapInner('<div class="' + container_class + '" />').find("." + container_class);
			
			// Wrap all tabs in a container element.
			self.tabs.wrapAll('<div class="' + opts.tabs_container_class + '" />');
			
			self.tabs.each(function(idx, element) {
				var name,
					$element = $(element);
				
				// Use the set element for the tab text or get
				// the first heading element and use that.
				name = tab_text_el ? $element.find(tab_text_el).hide().text() : $element.children().filter(function() {
						return (/h[1-6]/i).test($(this)[0].nodeName);
					})
					.filter(":first").hide().text();
				
				self.tab_names.push(name);
			});
		},
		
		// Generates the HTML markup for the tabs menu and
		// appends it to the relevant page of the page.
		buildTabMenu: function() {
			var self = this,
				opts = self.options,
				element = opts.tabsmenu_el,
				tab_names = self.tab_names,
				html = "<" + element + ' class="' + opts.tabsmenu_class + '">',
				tab_class,
				i = 0,
				len = tab_names.length,
				child_node_name,
				
				// Private func to build the tab HTML.
				buildTabs = function() {
					var args = arguments;
					
					// Replace any {0} placeholders with any text passed in as arguments.
					return opts.tmpl.tabsmenu_tab.replace(/\{[0-9]\}/g, function(str) {
						// Replace non-numeric chars and convert to number.
						var num = Number(str.replace(/\D/g, ""));
						
						// Return the relevant string from the args array based
						// on the placeholder number we're currently replacing.
						return args[num] || "";
					});
				};
			
			for (; i < len; i++) {
				// Create specific class name for each tab.
				tab_class = "tab-" + (i + 1);
				
				// Build HTML for each tab.
				html += buildTabs(tab_class, tab_names[i]);
			}
			
			// Close the container.
			html += "</" + element + ">";
			
			// Append it before the element and assign
			// to the prototype chain for use later.
			self.$tabs_menu = $(html).prependTo(self.$wrapper);
			
			// Get nodeName of the tab menu children
			// so we can delegate the click event to them.
			child_node_name = self.$tabs_menu.find(":first")[0].nodeName.toLowerCase();
			
			// Delegate click evens to each tab.
			self.$tabs_menu.on("click", child_node_name, function(e) {
					var $this = $(this),
						// Use the tab's index to associate it with it's content.
						idx = $this.index();
					
					// Select the tab.
					self.selectTab(idx);
					
					// Just in case an a element has been supplied as a template.
					e.preventDefault();
				})
				// Select and show the first tab.
				.find(":first").trigger("click");
		},
		
		// Toggle relevant tab based on the index passed in.
		selectTab: function(idx) {
			var self = this,
				opts = self.options,
				active_tab_class = opts.active_tab_class;
			
			// idx = typeof idx === "string" ? idx.replace(/\D/g, "") : idx;
			
			// Show the relevant tab content.
			self.tabs.hide().filter(":eq(" + idx + ")").show();
			
			// Switch tab class names.
			self.$tabs_menu.children().removeClass(active_tab_class).filter(":eq(" + idx + ")").addClass(active_tab_class);
			
			// Fire callback if defined.
			if (typeof opts.onTabSelect === "function") {
				opts.onTabSelect.call(self.element, idx);
			}
		}
	};
	
	// Add to $.fn namespace.
	$.fn.mtabs = function(options) {
		return this.each(function() {
			var $this = $(this),
				data = $this.data("mtabs");
			
			// Check is mtabs has already been applied.
			if (!data) {
				// Initialise new instance of MattTabs.
				$this.data("mtabs", (data = new MattTabs(this, options)));
			}
		});
	};
	
	// Default options.
	$.fn.mtabs.defaults = {
		container_class: "tabs", // Specifies class name(s) applied to the overall wrapping element.
		tabs_container_class: "tabs-content", // Specifies class name(s) applied to tabs content wrapping element.
		active_tab_class: "active-tab", // Specifies class name for currently active tab.
		tab_text_el: null, // Specifies element to generate the text from for each tab name.
		tabsmenu_class: "tabs-menu", // Specifies class name(s) applied to the tabs menu element.
		tabsmenu_el: "ul", // Specifies element to use as a wrapper for tabs menu items.
		tmpl: { // Templates used for building HTML structures.
			tabsmenu_tab: '<li class="{0}"><span>{1}</span></li>'
		},
		onTabSelect: null // Optional callback function to be executed when tab switch occurs. Receives the index of the selected tab as an argument. Default is no callback.
	};
})(window.jQuery, window, document, undefined);