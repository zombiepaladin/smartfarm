class CropsController < InheritedResources::Base
  respond_to :js, only: [:show]

  def create
    @crop = Crop.new(resource_params)
    @crop.user = current_user
    create!
  end

  def new
    @crop = Crop.create(user: current_user, workspace: "<xml id=\"workspace\" style=\"display: none\"></xml>")
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
