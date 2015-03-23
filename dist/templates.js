angular.module('notifsta').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/admin/main.html',
    "<link rel=\"stylesheet\" href=\"app/admin/admin.css\" media=\"screen\">\n" +
    "<!--<div ng-controller=\"EventLoginController\" ng-include src=\"'/app/event_login/main.html'\"></div>-->\n" +
    "\n" +
    "<!--<div ng-show=\"!logged_in()\">-->\n" +
    "    <!--<div>-->\n" +
    "      <!--OUR USER ID: {{ user_id() }}-->\n" +
    "      <!--{{ logged_in ()}}-->\n" +
    "      <!--<br/>-->\n" +
    "      <!--LOGGED IN? {{ logged_in() }}-->\n" +
    "    <!--</div>-->\n" +
    "\n" +
    "    <!--<input type=\"text\"-->\n" +
    "           <!--ng-model=\"input.email\"-->\n" +
    "           <!--autofocus />-->\n" +
    "    <!--<input type=\"text\"-->\n" +
    "           <!--ng-model=\"input.password\"-->\n" +
    "           <!--autofocus />-->\n" +
    "    <!--<button ng-click=\"login()\">LOGIN</button>-->\n" +
    "\n" +
    "<!--</div>-->\n" +
    "\n" +
    "<div class=\"row header\">\n" +
    "  <div class=\"logo\" style=\"float:left;\">\n" +
    "  </div>\n" +
    "  <div style=\"float:left; margin-left: 25px\">\n" +
    "    <center>\n" +
    "      <h1>{{ event.name }}</h1>\n" +
    "    </center>\n" +
    "    <!--<div class=\"logout\" ng-click=\"logout()\">-->\n" +
    "      <!--<i class=\"glyphicon glyphicon-log-out\"></i> &nbsp Log Out-->\n" +
    "    <!--</div>-->\n" +
    "  </div>\n" +
    "</div>\n" +
    "<!--<div class=\"row content\" >-->\n" +
    "\n" +
    "  <!--<div class=\"col-md-2\">-->\n" +
    "    <!--[> Select events here <]-->\n" +
    "    <!--<h2> Events </h2>-->\n" +
    "    <!--<div class=\"list-group\">-->\n" +
    "      <!--<a href =\"#\" -->\n" +
    "        <!--ng-repeat=\"event in data.User.events\" -->\n" +
    "        <!--class=\"list-group-item\"-->\n" +
    "        <!--ng-class=\"{ active : event.active }\" -->\n" +
    "        <!--ng-click=\"SelectEvent(event)\">-->\n" +
    "        <!--{{ event.name }}-->\n" +
    "        <!--<span class=\"badge\" ng-show=\"event.new_messages > 0\">-->\n" +
    "          <!--{{ event.new_messages }}-->\n" +
    "        <!--</span>-->\n" +
    "      <!--</a>-->\n" +
    "    <!--</div>-->\n" +
    "  <!--</div>-->\n" +
    "<!--</div>-->\n" +
    "<div class=\"row content\" >\n" +
    "\n" +
    "  <div class=\"col-md-2 sidepanel\">\n" +
    "\n" +
    "    <div ng-controller=\"CreateChannel\" ng-include src=\"'/app/create_channel/main.html'\"></div>\n" +
    "\n" +
    "            <label class=\"select\" ng-show=\"!info\" style=\"margin-top:5px; margin-left: 10px;\">\n" +
    "\n" +
    "          <span class=\"helper\" ng-show = \"selected_none()\">\n" +
    "            Select a channel to start broadcasting!\n" +
    "          </span>\n" +
    "                            <span class=\"helper\" ng-show = \"!selected_none()\">\n" +
    "            Posting to \n" +
    "            <span ng-repeat = \"channel in data.Event.channels\" ng-show=\"channel.selected\">\n" +
    "              #{{ channel.name }}\n" +
    "            </span>\n" +
    "          </span>\n" +
    "        </label>\n" +
    "\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"col-md-9\">\n" +
    "\n" +
    "    <div class=\"row newnotice\">\n" +
    "\n" +
    "      <form ng-submit=\"broadcast_notice()\" class=\"new-notice-form\">\n" +
    "\n" +
    "        <input class=\"newnoticeinput\" type=\"text\" placeholder=\"Write a new notice...\" ng-model=\"input.message\" ng-show=\"!step2\" ng-disabled=\"selected_none() || loading\">\n" +
    "        <input type=\"submit\" style=\"position: absolute; left: -9999px; width: 1px; height: 1px;\"/>\n" +
    "        <label ng-show=\"info\" style=\"margin-top:5px; margin-left: 10px\">\n" +
    "          {{ info }}\n" +
    "        </label>\n" +
    "\n" +
    "      </form>\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Stats -->\n" +
    "    <div class=\"row stats\">\n" +
    "\n" +
    "      <div class=\"col-md-4 stat stat-left\">\n" +
    "\n" +
    "        <div class=\"actual-stat\">\n" +
    "\n" +
    "          <div class=\"stat-icon blue\">\n" +
    "\n" +
    "            <img src=\"http://i.imgur.com/EAvk6oK.png\" class=\"icon\">\n" +
    "          </div>\n" +
    "          <div class=\"stat-text\">\n" +
    "            <span class=\"stat-number\">  187 {{ data.Event.total_subscribers }}</span>\n" +
    "            <span class=\"stat-unit\">total subscribers</span>\n" +
    "          </div>\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"col-md-4 stat stat-middle\">\n" +
    "\n" +
    "        <div class=\"actual-stat\">\n" +
    "\n" +
    "          <div class=\"stat-icon orange\">\n" +
    "\n" +
    "            <img src=\"http://i.imgur.com/pdRyqvB.png\" class=\"icon\">\n" +
    "\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=\"stat-text\">\n" +
    "\n" +
    "            <span class=\"stat-number\"> {{ data.Event.total_broadcasts }}</span>\n" +
    "            <span class=\"stat-unit\">&nbsp total broadcasts</span>\n" +
    "\n" +
    "          </div>\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "      </div>\n" +
    "\n" +
    "      <div class=\"col-md-4 stat stat-right\">\n" +
    "\n" +
    "        <div class=\"actual-stat\">\n" +
    "\n" +
    "          <div class=\"stat-icon green\">\n" +
    "\n" +
    "            <img src=\"http://i.imgur.com/EAvk6oK.png\" class=\"icon\">\n" +
    "\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=\"stat-text\">\n" +
    "\n" +
    "            <span class=\"stat-number\">55</span>\n" +
    "            <span class=\"stat-unit\">somethings</span>\n" +
    "\n" +
    "          </div>\n" +
    "\n" +
    "        </div>\n" +
    "\n" +
    "      </div>\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "    <!-- Feeds -->\n" +
    "    <div class=\"row two\">\n" +
    "      <div class=\"col-md-4\"\n" +
    "        ng-repeat=\"channel in data.Event.channels\"\n" +
    "        ng-show=\"channel.selected\">\n" +
    "        <div class=\"row box-title red\">\n" +
    "          <div class=\"dropdown\" style=\"float:left\">\n" +
    "            <a  class='icon-click dropdown-toggle' id=\"dropdownmenu\"data-toggle=\"dropdown\"><i class=\"glyphicon glyphicon-list\"></i></a>\n" +
    "            <ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"dropdownmenu\">\n" +
    "              <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" >Invite People</a></li>\n" +
    "              <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" >Rename</a></li>\n" +
    "              <li role=\"presentation\"><a role=\"menuitem\" tabindex=\"-1\" >Delete</a></li>\n" +
    "            </ul>\n" +
    "          </div>\n" +
    "          <div style=\"float:left; margin-left: 15px;\">\n" +
    "            {{ channel.name }} - {{ channel.number_of_subscribers }}\n" +
    "          </div>\n" +
    "        </div>\n" +
    "        <div class=\"actual-feed\">\n" +
    "\n" +
    "          <div class=\"feed-item\" ng-repeat=\"notif in channel.notifications\">\n" +
    "            <div class=\"feed-item-time\">{{ notif.time }}</div> \n" +
    "            <div class=\"feed-item-text\">{{ notif.notification_guts }}</div>\n" +
    "          </div>\n" +
    "          <div class=\"feed-item\" ng-show=\"channel.notifications.length == 0\">\n" +
    "            <div class=\"feed-item-text\"> It's lonely in here - send a message now! </div>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "        <!--<div class=\"col-md-6 feed\">-->\n" +
    "\n" +
    "          <!--<div class=\"actual-feed\">-->\n" +
    "\n" +
    "              <!--<div class=\"row box-title red\">-->\n" +
    "\n" +
    "                <!--<i class=\"glyphicon glyphicon-list\"></i> &nbsp Broadcast Feed-->\n" +
    "\n" +
    "              <!--</div>-->\n" +
    "\n" +
    "              <!--<div class=\"feed-item\">-->\n" +
    "\n" +
    "                <!--<span class=\"feed-item-time\">19:34</span> &nbsp<span class=\"feed-item-text\">Announcement: Food is ready! Come to the fourth floor to get it.</span>-->\n" +
    "\n" +
    "              <!--</div>-->\n" +
    "\n" +
    "              <!--<div class=\"feed-item\">-->\n" +
    "\n" +
    "                <!--<span class=\"feed-item-time\">22:02</span> &nbsp<span class=\"feed-item-text\">Announcement: Food is ready! Come to the fourth floor to get it.</span>-->\n" +
    "\n" +
    "              <!--</div>-->\n" +
    "\n" +
    "          <!--</div>-->\n" +
    "\n" +
    "        <!--</div>-->\n" +
    "\n" +
    "        <!--<div class=\"col-md-6 graph\">-->\n" +
    "\n" +
    "          <!--<div class=\"actual-graph\">-->\n" +
    "\n" +
    "            <!--<div class=\"row box-title blue\">-->\n" +
    "\n" +
    "              <!--<i class=\"glyphicon glyphicon-folder-open\"></i> &nbsp Notification Open Rate-->\n" +
    "\n" +
    "            <!--</div>-->\n" +
    "\n" +
    "          <!--</div>-->\n" +
    "\n" +
    "        <!--</div>-->\n" +
    "\n" +
    "    </div>\n" +
    "\n" +
    "  </div>\n" +
    "\n" +
    "</div>\n" +
    "<!---->\n"
  );


  $templateCache.put('app/create_channel/main.html',
    "<div>\n" +
    "\t<form ng-submit=\"create_channel()\">\n" +
    "    <input type=\"text\"\n" +
    "    \t\tclass=\"newchannelinput\"\n" +
    "           ng-model=\"input.channel_name\"\n" +
    "           placeholder=\"Channels\"\n" +
    "           autofocus \n" +
    "           ng-disabled=\"1\"/><br>\n" +
    "    <input type=\"submit\" style=\"position: absolute; left: -9999px; width: 1px; height: 1px;\"/>\n" +
    "  </form>\n" +
    "    <!--<div class=\"channel-list\" ng-repeat=\"channel in event.channels\">-->\n" +
    "    <div class=\"list-group\">\n" +
    "      <a ng-repeat=\"channel in data.Event.channels\" \n" +
    "        class=\"list-group-item\"\n" +
    "        ng-class=\"{ active : channel.selected }\" \n" +
    "        ng-click=\"SelectChannel(channel)\">\n" +
    "        #{{ channel.name }}\n" +
    "      </a>\n" +
    "    </div>\n" +
    "    <!--<div class=\"newchannel-status\">{{ status }}</div>-->\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('app/create_event/main.html',
    "<div>\n" +
    "    <div>\n" +
    "      OUR EVENT ID: {{ event_id() }}\n" +
    "    </div>\n" +
    "\n" +
    "    <input type=\"text\"\n" +
    "           ng-model=\"input.eventname\"\n" +
    "           autofocus />\n" +
    "    <input type=\"text\"\n" +
    "           ng-model=\"input.password\"\n" +
    "           autofocus />\n" +
    "    <button ng-click=\"login()\">LOGIN</button>\n" +
    "    <button ng-click=\"logout()\">LOGOUT</button>\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('app/create_notification/main.html',
    "<div>\n" +
    "    <div>\n" +
    "      OUR EVENT ID: {{ event_id() }}\n" +
    "    </div>\n" +
    "\n" +
    "    <input type=\"text\"\n" +
    "           ng-model=\"input.eventname\"\n" +
    "           autofocus />\n" +
    "    <input type=\"text\"\n" +
    "           ng-model=\"input.password\"\n" +
    "           autofocus />\n" +
    "    <button ng-click=\"login()\">LOGIN</button>\n" +
    "    <button ng-click=\"logout()\">LOGOUT</button>\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('app/dashboard/main.html',
    "<h5>This is the dashboard that the user will see once he/she logs in!</h5>\r" +
    "\n"
  );


  $templateCache.put('app/event_login/main.html',
    "<div>\n" +
    "    <div>\n" +
    "      OUR EVENT ID: {{ event_id() }}\n" +
    "    </div>\n" +
    "\n" +
    "    <input type=\"text\"\n" +
    "           ng-model=\"input.eventname\"\n" +
    "           autofocus />\n" +
    "    <input type=\"text\"\n" +
    "           ng-model=\"input.password\"\n" +
    "           autofocus />\n" +
    "    <button ng-click=\"login()\">LOGIN</button>\n" +
    "    <button ng-click=\"logout()\">LOGOUT</button>\n" +
    "</div>\n" +
    "\n"
  );


  $templateCache.put('app/home/main.html',
    "<h5>This is the home page that will sell this thing as the greatest thing since sliced bread</h5>\r" +
    "\n"
  );


  $templateCache.put('app/login/main.html',
    "<div class=\"col-sm-6 \">\r" +
    "\n" +
    "  <h1>Sign in</h1>\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <form class=\"new_user\" \r" +
    "\n" +
    "    ng-submit=\"AttemptLogin()\"\r" +
    "\n" +
    "    accept-charset=\"UTF-8\" >\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label for=\"user_email\">Email</label>\r" +
    "\n" +
    "      <div class=\"row\">\r" +
    "\n" +
    "        <div class=\"col-sm-6\">\r" +
    "\n" +
    "          <input autofocus=\"autofocus\" class=\"form-control\" type=\"text\" ng-model=\"credentials.email\">\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label for=\"user_password\">Password</label>\r" +
    "\n" +
    "      <div class=\"row\">\r" +
    "\n" +
    "        <div class=\"col-sm-6\">\r" +
    "\n" +
    "          <input class=\"form-control\" type=\"password\" ng-model=\"credentials.password\">\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <div class=\"row\">\r" +
    "\n" +
    "        <div class=\"col-sm-6\">\r" +
    "\n" +
    "          <input type=\"checkbox\" value=\"1\"> \r" +
    "\n" +
    "          <label for=\"user_remember_me\">Remember me</label>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"row\">\r" +
    "\n" +
    "      <div class=\"col-sm-6\">\r" +
    "\n" +
    "        <input type=\"submit\" class=\"btn btn-primary\">\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </form>\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <b style =\"color:grey\">{{ info }}</b>\r" +
    "\n" +
    "  <div class=\"row shared-links\">\r" +
    "\n" +
    "    <div class=\"col-sm-8\">\r" +
    "\n" +
    "      <a href=\"#\">Forgot your password?</a><br>\r" +
    "\n" +
    "      <a href=\"#sign_up\">Sign up</a><br>\r" +
    "\n" +
    "      <a href=\"#\">Didn't receive confirmation instructions?</a><br>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('app/logout/main.html',
    "<h3>Logging out...</h3>\r" +
    "\n"
  );


  $templateCache.put('app/signup/main.html',
    "<div class=\"col-sm-6\">\r" +
    "\n" +
    "  <h1>Sign up</h1>\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <form role=\"form\" class=\"new_user\" id=\"new_user\" action=\"/users\" accept-charset=\"UTF-8\" method=\"post\"><input name=\"utf8\" type=\"hidden\" value=\"✓\"><input type=\"hidden\" name=\"authenticity_token\" value=\"WMAqTf7r6YIFhsuPMeNIvh4FvXbCZ/QOvnD9okioE26GEXiqFn7ZoSDIlEa7yfU5js6At4i7fjearR6edomXTg==\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <label for=\"user_email\">Email</label>\r" +
    "\n" +
    "      <div class=\"row\">\r" +
    "\n" +
    "        <div class=\"col-sm-6\">\r" +
    "\n" +
    "          <input class=\"form-control\" type=\"email\" value=\"\" name=\"user[email]\" id=\"user_email\">\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <div class=\"row\">\r" +
    "\n" +
    "        <div class=\"col-sm-6\">\r" +
    "\n" +
    "          <label for=\"user_password\">Password</label>\r" +
    "\n" +
    "          <input class=\"form-control\" type=\"password\" name=\"user[password]\" id=\"user_password\">\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"form-group\">\r" +
    "\n" +
    "      <div class=\"row\">\r" +
    "\n" +
    "        <div class=\"col-sm-6\">\r" +
    "\n" +
    "          <label for=\"user_password_confirmation\">Password confirmation</label>\r" +
    "\n" +
    "          <input class=\"form-control\" type=\"password\" name=\"user[password_confirmation]\" id=\"user_password_confirmation\">\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"row\">\r" +
    "\n" +
    "      <div class=\"col-sm-6\">\r" +
    "\n" +
    "        <input type=\"submit\" name=\"commit\" value=\"Sign up\" class=\"btn btn-primary\">\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </form>\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <div class=\"row shared-links\">\r" +
    "\n" +
    "    <div class=\"col-sm-8\">\r" +
    "\n" +
    "      <a href=\"/users/sign_in\">Sign in</a><br>\r" +
    "\n" +
    "      <a href=\"/users/confirmation/new\">Didn't receive confirmation instructions?</a><br>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('app/user/main.html',
    "\r" +
    "\n" +
    "<a href=\"/admin\">admin</a>\r" +
    "\n" +
    "<!--<div ng-controller=\"EventLoginController\" ng-include src=\"'/app/event_login/main.html'\"></div>-->\r" +
    "\n" +
    "<!--<div ng-show=\"!logged_in()\">-->\r" +
    "\n" +
    "    <!--<div>-->\r" +
    "\n" +
    "      <!--OUR USER ID: {{ user_id() }}-->\r" +
    "\n" +
    "      <!--{{ logged_in ()}}-->\r" +
    "\n" +
    "      <!--<br/>-->\r" +
    "\n" +
    "      <!--LOGGED IN? {{ logged_in() }}-->\r" +
    "\n" +
    "    <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <!--<input type=\"text\"-->\r" +
    "\n" +
    "           <!--ng-model=\"input.email\"-->\r" +
    "\n" +
    "           <!--autofocus />-->\r" +
    "\n" +
    "    <!--<input type=\"text\"-->\r" +
    "\n" +
    "           <!--ng-model=\"input.password\"-->\r" +
    "\n" +
    "           <!--autofocus />-->\r" +
    "\n" +
    "    <!--<button ng-click=\"login()\">LOGIN</button>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "<!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"row header\">\r" +
    "\n" +
    "  <div class=\"logo\" style=\"float:left;\">\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div style=\"float:left; margin-left: 25px\">\r" +
    "\n" +
    "    <center>\r" +
    "\n" +
    "      <h1>Welcome {{ data.User.email }}</h1>\r" +
    "\n" +
    "    </center>\r" +
    "\n" +
    "    <!--<div class=\"logout\" ng-click=\"logout()\">-->\r" +
    "\n" +
    "      <!--<i class=\"glyphicon glyphicon-log-out\"></i> &nbsp Log Out-->\r" +
    "\n" +
    "    <!--</div>-->\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"row content\">\r" +
    "\n" +
    "  <div class=\"col-md-2\">\r" +
    "\n" +
    "    <!-- Select events here -->\r" +
    "\n" +
    "    <h2> Events </h2>\r" +
    "\n" +
    "    <div class=\"list-group\">\r" +
    "\n" +
    "      <a href =\"#\" \r" +
    "\n" +
    "        ng-repeat=\"event in data.User.events\" \r" +
    "\n" +
    "        class=\"list-group-item\"\r" +
    "\n" +
    "        ng-class=\"{ active : event.active }\" \r" +
    "\n" +
    "        ng-click=\"SelectEvent(event)\">\r" +
    "\n" +
    "        {{ event.name }}\r" +
    "\n" +
    "        <span class=\"badge\" ng-show=\"event.new_messages > 0\">\r" +
    "\n" +
    "          {{ event.new_messages }}\r" +
    "\n" +
    "        </span>\r" +
    "\n" +
    "      </a>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "  <div class=\"col-md-9\">\r" +
    "\n" +
    "    <h2> Broadcast Feeds </h2>\r" +
    "\n" +
    "    <div class=\"col-md-4\"\r" +
    "\n" +
    "      ng-repeat=\"channel in selected_event.channels\">\r" +
    "\n" +
    "      <div class=\"actual-feed\">\r" +
    "\n" +
    "        <div class=\"row box-title red\">\r" +
    "\n" +
    "          <i class=\"glyphicon glyphicon-list\"></i> &nbsp {{ channel.name }}\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"feed-item\" ng-repeat=\"message in channel.messages\">\r" +
    "\n" +
    "          <div class=\"feed-item-time\">{{ message.time }}</div> \r" +
    "\n" +
    "          <div class=\"feed-item-text\">{{ message.message }}</div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <!--<div class=\"row newnotice\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "      <!--<form ng-submit=\"nextstep()\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "        <!--<input class=\"newnoticeinput\" type=\"text\" placeholder=\"Write a new notice...\" ng-model=\"input.broadcast\" ng-show=\"!step2\">-->\r" +
    "\n" +
    "        <!--<input type=\"submit\" style=\"position: absolute; left: -9999px; width: 1px; height: 1px;\"/>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "      <!--</form>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "      <!--<form ng-submit=\"finalstep()\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "      <!--<tags-input ng-show=\"step2\" ng-model=\"tags\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "      <!--</tags-input>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "      <!--<input type=\"submit\" style=\"position: absolute; left: -9999px; width: 1px; height: 1px;\"/>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "      <!--</form>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <!--<div class=\"row stats\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "      <!--<div class=\"col-md-4 stat stat-left\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "        <!--<div class=\"actual-stat\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "          <!--<div class=\"stat-icon blue\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <!--<img src=\"http://i.imgur.com/EAvk6oK.png\" class=\"icon\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "          <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "          <!--<div class=\"stat-text\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "              <!--<span class=\"stat-number\">187</span>-->\r" +
    "\n" +
    "              <!--<span class=\"stat-unit\">app users</span>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "          <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "        <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "      <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "      <!--<div class=\"col-md-4 stat stat-middle\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "        <!--<div class=\"actual-stat\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "          <!--<div class=\"stat-icon orange\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <!--<img src=\"http://i.imgur.com/pdRyqvB.png\" class=\"icon\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "          <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "          <!--<div class=\"stat-text\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <!--<span class=\"stat-number\">16</span>-->\r" +
    "\n" +
    "            <!--<span class=\"stat-unit\">&nbspbroadcasts</span>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "          <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "        <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "      <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "      <!--<div class=\"col-md-4 stat stat-right\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "        <!--<div class=\"actual-stat\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "          <!--<div class=\"stat-icon green\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <!--<img src=\"http://i.imgur.com/EAvk6oK.png\" class=\"icon\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "          <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "          <!--<div class=\"stat-text\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <!--<span class=\"stat-number\">55</span>-->\r" +
    "\n" +
    "            <!--<span class=\"stat-unit\">somethings</span>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "          <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "        <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "      <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <!--<div class=\"row two\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "        <!--<div class=\"col-md-6 feed\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "          \r" +
    "\n" +
    "\r" +
    "\n" +
    "        <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "        <!--<div class=\"col-md-6 graph\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "          <!--<div class=\"actual-graph\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <!--<div class=\"row box-title blue\">-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "              <!--<i class=\"glyphicon glyphicon-folder-open\"></i> &nbsp Notification Open Rate-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "            <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "          <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "        <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "  <!--</div>-->\r" +
    "\n" +
    "\r" +
    "\n" +
    "<!---->\r" +
    "\n"
  );

}]);
