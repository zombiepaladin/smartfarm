class FarmsController < InheritedResources::Base
  respond_to :json, only: :show

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
    # TODO: Create a clone if we aren't the owner
    @farm = Farm.find(params[:id])
    update!
  end

private

  def resource_params
    params.require(:farm).permit(:name, :latitude, :longitude, :description, :data)
  end
  
end
