class SimulationsController < InheritedResources::Base
  respond_to :js, only: [:show]
  respond_to :json, only: [:show]

  def index
    @simulations = Simulation.page
    index!
  end

  def show
    @simulation = Simulation.find(params[:id])
    @crops = Crop.page 
    data = JSON.parse @simulation.state
    @farm = Farm.find data["farm"]["id"] if data["farm"]
    show!
  end

  def create
    @simulation = Simulation.new(resource_params)
    @simulation.user = current_user
    create!
  end

  def edit
    @simulation = Simulation.find(params[:id])
    data = JSON.parse @simulation.state
    edit!
  end

private

  def resource_params
    params.require(:simulation).permit(:name, :start_on, :end_on, :description, :farm_id, :weather_id, :state)
  end

end
