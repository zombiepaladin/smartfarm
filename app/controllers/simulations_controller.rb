class SimulationsController < InheritedResources::Base
  respond_to :js, only: [:show]
  respond_to :json, only: [:show]

  def create
    @simulation = Simulation.new(resource_params)
    @simulation.user = current_user
    create!
  end

  def edit
    @simulation = Simulation.find(params[:id])
    data = JSON.parse @simulation.state
    @farm = Farm.find data["farm"]["id"] if data["farm"]
    @weather = Weather.find data["weather"]["id"] if data["weather"]
  end

private

  def resource_params
    params.require(:simulation).permit(:name, :start_on, :end_on, :description, :farm, :weather, :state)
  end

end
