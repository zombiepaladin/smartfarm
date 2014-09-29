class FarmsController < InheritedResources::Base
  respond_to :js, only: [:index, :delete]
  respond_to :json, only: :show

  def index
	if params[:tag]
		@farms = Farm.tagged_with(params[:tag]).page params[:page]
		index!
	else
		@farms = Farm.page params[:page]
		index!
	end
  end

  def create
    @farm = Farm.new(resource_params)
    @farm.user = current_user
    create!
  end

  def new
    @farm = Farm.create(
      user: current_user, 
      name: "Unnamed farm", 
      latitude: 39.1974437, 
      longitude: -96.5847248999, 
      data: '{"name":"Unnamed farm", "location": {"latitude": 39.1974437, "longitude": -96.5847248999}, "field_bounds": [], "elevation_samples": [], "soil_samples": []}'
    )
#    render :edit
  end

  def update
	
    #Create a clone if we aren't the owner
	if Farm.find(params[:id]).user.id != current_user.id
		@farm = Farm.find(params[:id]).dup
		@farm.user = current_user
	else
		@farm = Farm.find(params[:id])
	end
	update!
  end

  def destroy
	@farm = Farm.find(params[:id])
	@farm.destroy
  end

private

  def resource_params
    params.require(:farm).permit(:name, :latitude, :longitude, :description, :data, :tag_list)
  end
  
end
