class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
#  protect_from_forgery with: :exception
  
  before_filter :authenticate_user!, except: [:index]
  before_filter :store_location

  def store_location
    return unless request.get?
    if(request.path != "/users/sign_in" &&
       request.path != "/users/sign_up" &&
       request.path != "/users/password/new" &&
       request.path != "/users/sign_out" &&
       !request.xhr?)
      session[:previous_url] = request.fullpath
    end
  end

  def after_sign_in_path_for(resource)
    session[:previous_url] || root_path
  end
  
  
  
  before_action :set_max_tags_shown		#, only: [:index, :show]
  
  def set_max_tags_shown
	@maxTagsShown = 20
	@maxTagsShownPerFarm = 8
  end

end
