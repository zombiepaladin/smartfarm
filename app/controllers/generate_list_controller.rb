require 'csv'
class GenerateListController < ApplicationController
  respond_to :xml

  def csv  
    @filename = params[:file].original_filename
    @data = "["
    CSV.parse params[:file].read do |row|
      @data << "["
      @data << row.collect{|d| d.is_numeric? ? d : "\"#{d}\""}.join(",")
      @data << "],"
    end
    @data << "]"
  end


end
