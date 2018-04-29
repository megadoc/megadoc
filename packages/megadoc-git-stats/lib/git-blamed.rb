#!/usr/bin/env ruby

require 'webrick'
require 'json'

class GitBlamed
  RE_SHORTLOG = /(\d+)\s(.+?)(\s{1}<.+@.+>$|$)/.freeze
  RE_EXTRACT_EMAIL = /^\<|\>$/.freeze

  def stat(file)
    buffer = `
      git log -1 --format="%cd" --date=raw -- "#{file}" &&
      git shortlog -e -s -n HEAD -- "#{file}"
    `

    JSON.dump(parse(file, buffer))
  end

  def parse(file, buffer)
    lines = buffer.split("\n").map(&:strip)

    unless lines.empty?
      updated_at = lines.shift.split(' ')[0].to_i
      authors = lines.reject(&:empty?).map { |s| s.scan(RE_SHORTLOG) }.compact.map do |fragments|
        count, name, email = fragments[0]

        {
          c: count.to_i,
          n: name,
          e: email ? email.strip.gsub(RE_EXTRACT_EMAIL, '') : ''
        }
      end
    end

    {
      updated_at: updated_at || 0,
      authors: authors || []
    }
  end
end

blamed = GitBlamed.new

server = WEBrick::HTTPServer.new({
  BindAddress: '127.0.0.1',
  Port: ENV.fetch('PORT').to_i,
  Logger: WEBrick::Log.new(File.open(File::NULL, 'w')),
  AccessLog: [],
  StartCallback: Proc.new {
    STDOUT.puts "READY"
    STDOUT.flush
  }
})

at_exit do
  server.shutdown rescue nil
end

trap 'INT' do
  server.shutdown rescue nil
end

server.mount_proc '/' do |req, res|
  res.body = blamed.stat(req['X-File'])
end

server.start

