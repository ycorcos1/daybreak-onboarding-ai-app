# This configuration file will be evaluated by Puma. The top-level methods that
# are invoked here are part of Puma's configuration DSL. For more information
# about methods provided by the DSL, see https://puma.io/puma/Puma/DSL.html.

# Puma starts a configurable number of processes (workers) and each process
# serves each request in a thread from an internal thread pool.
#
max_threads_count = ENV.fetch("RAILS_MAX_THREADS", 5).to_i
min_threads_count = ENV.fetch("RAILS_MIN_THREADS", max_threads_count).to_i
threads min_threads_count, max_threads_count

port ENV.fetch("PORT", 3000)

# Specifies the `environment` that Puma will run in.
environment ENV.fetch("RAILS_ENV", "development")

# Specify the PID file (used by Aptible).
pidfile ENV.fetch("PIDFILE", "tmp/pids/server.pid")

# Configure worker processes for multi-core usage in production.
workers ENV.fetch("WEB_CONCURRENCY", 2)

# Preload the application for faster worker boot.
preload_app!

on_worker_boot do
  ActiveRecord::Base.establish_connection if defined?(ActiveRecord)
end

plugin :tmp_restart
