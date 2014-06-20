class SimulationsController < InheritedResources::Base

  def create
    @simulation = Simulation.new(resource_params)
    @simulation.user = current_user
    create!
  end

private

  def resource_params
    params.require(:simulation).permit(:name, :start_on, :end_on, :description)
  end

end
