module BlocklyEditorHelper

  def io_item(id, label, value, options = {})
    type = options[:as] ? options[:as].to_sym : :number
    content_tag :li, "#{io_tag(type, id, value)} #{label} <span class=\"clear\"></span>".html_safe, class: "list-group-item"
  end

private 

  def io_tag(type, id, value)
    case type
    when :text
      text_field_tag id, value, class: "pull-right"
    when :number
      number_field_tag id, value, class: "pull-right"
    when :datetime
      datetime_field_tag id, value, class: "pull-right"
    else 
      text_field_tag id, value, class: "pull-right"
    end  
  end

end
