class SoilsController < InheritedResources::Base
  respond_to :js, only: [:index, :destroy]
  respond_to :json, only: [:show, :update]

  def index
    @soils = Soil.page params[:page]
    index!
  end

  def create
    @soil = Soil.new(resource_params)
    @soil.user = current_user
    create!
  end

  def new
    @soil = Soil.create(user: current_user, workspace: "<xml id=\"workspace\" style=\"display: none\"></xml>")
    redirect_to edit_soil_path(@soil)
  end

  def update
    #TODO: Create a clone if we aren't the owner
    @soil = Soil.find(params[:id])
    if @soil.update(resource_params)
      render text: "Successfully saved #{@soil.name}"
    else
      render text: "Unable to save #{@soil.name}: #{@soil.errors.full_messages.join(', ')}"
    end
  end

  def destroy
    @soil = Soil.find(params[:id])
    @soil.destroy
  end


private

  def resource_params
    params.require(:soil).permit(:name, :code, :description, :workspace)
  end

end
