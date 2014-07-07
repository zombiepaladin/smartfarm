class CropsController < InheritedResources::Base
  respond_to :js, only: [:show]

  def showy
    render text: '{"id":1,"user_id":1,"scripts":[[76,43,[["receiveGo"],["doForever", [["doWait","1"]]]]]],"variables":[{"name":"punk","value":"lucky"}],"name":"Winter Wheat","description":"Blah, Blah, Blah","code":"","created_at":"2014-04-03T15:52:46.299Z","updated_at":"2014-04-04T02:10:23.899Z"}'
  end

  def create
    @crop = Crop.new(resource_params)
    @crop.user = current_user
    create!
  end

  def new
    @crop = Crop.create(user: current_user)
    redirect_to edit_crop_path(@crop)
  end

  def update
    # TODO: Create a clone if we aren't the owner
    @crop = Crop.find(params[:id])
    if @crop.update(resource_params)
      render text: "Successfully saved #{@crop.name}"
    else
      render json: "{'message':'Failed', 'errors':'#{@crop.errors.full_messages.join(",")}'}"
    end
  end

  private
 
  def resource_params
    params.require(:crop).permit(:name, :code, :description, :workspace)
  end
  
end
